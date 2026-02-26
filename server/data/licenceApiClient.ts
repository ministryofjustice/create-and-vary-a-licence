import { Readable } from 'stream'
import RestClient from './hmppsRestClient'
import type {
  AddAdditionalConditionRequest,
  AddAddressRequest,
  AdditionalCondition,
  AdditionalConditionsRequest,
  AddressResponse,
  AddressSearchResponse,
  AppointmentAddressRequest,
  AppointmentPersonRequest,
  AppointmentTimeRequest,
  ApprovalCase,
  ApproverSearchRequest,
  ApproverSearchResponse,
  AuditEvent,
  AuditRequest,
  BespokeConditionsRequest,
  CaCase,
  CaCaseloadSearch,
  CaseAccessDetails,
  CheckCaseAccessRequest,
  ComCreateCase,
  ComReviewCount,
  ComSearchResponse,
  ComVaryCase,
  ContactNumberRequest,
  CreateLicenceResponse,
  CreateVariationResponse,
  CurfewTimesRequest,
  EditLicenceResponse,
  EligibilityAssessment,
  ExternalTimeServedRecordRequest,
  ExternalTimeServedRecordResponse,
  HdcLicenceData,
  LastMinuteHandoverCaseResponse,
  Licence,
  LicenceConditionChange,
  LicenceEvent,
  LicencePermissionsRequest,
  LicencePermissionsResponse,
  LicencePolicyResponse,
  LicenceSummary,
  NotifyRequest,
  OmuContact,
  OverrideLicenceDatesRequest,
  OverrideLicencePrisonerDetailsRequest,
  OverrideLicenceTypeRequest,
  PrisonCaseAdminSearchResult,
  PrisonerWithCvlFields,
  PrisonUserSearchRequest,
  ProbationSearchRequest,
  ReferVariationRequest,
  StatusUpdateRequest,
  TeamCaseloadRequest,
  TimeServedCaseload,
  TimeServedProbationConfirmContactRequest,
  UpcomingReleasesWithMonitoringConditionsResponse,
  UpdateAdditionalConditionDataRequest,
  UpdateComRequest,
  UpdateElectronicMonitoringProgrammeRequest,
  UpdateOffenderDetailsRequest,
  UpdatePrisonInformationRequest,
  UpdatePrisonUserRequest,
  UpdateReasonForVariationRequest,
  UpdateSpoDiscussionRequest,
  UpdateStandardConditionDataRequest,
  UpdateVloDiscussionRequest,
  VaryApproverCase,
  VaryApproverCaseloadSearchRequest,
  VaryApproverCaseloadSearchResponse,
} from '../@types/licenceApiClientTypes'
import config, { ApiConfig } from '../config'
import { User } from '../@types/CvlUserDetails'
import LicenceType from '../enumeration/licenceType'
import LicenceStatus from '../enumeration/licenceStatus'
import type { TokenStore } from './tokenStore'
import logger from '../../logger'
import { isVariation } from '../utils/utils'

export default class LicenceApiClient extends RestClient {
  constructor(tokenStore: TokenStore) {
    super(tokenStore, 'Licence API', config.apis.licenceApi as ApiConfig)
  }

  async getOmuEmail(prisonId: string, user: User): Promise<OmuContact | null> {
    try {
      return (await this.get(
        { path: `/omu/${prisonId}/contact/email` },
        { username: user.username },
      )) as Promise<OmuContact>
    } catch (error) {
      logger.error(`Error when fetching OMU email for prisonId: ${prisonId}`)
      return error.status >= 400 && error.status < 500 ? null : error
    }
  }

  async updateOmuEmailAddress(prisonId: string, user: User, omuEmail: Record<string, string>): Promise<OmuContact> {
    try {
      return (await this.put(
        { path: `/omu/${prisonId}/contact/email`, data: omuEmail },
        { username: user.username },
      )) as Promise<OmuContact>
    } catch (error) {
      return error.status >= 400 && error.status < 500 ? null : error
    }
  }

  async deleteOmuEmailAddress(prisonId: string, user: User): Promise<void> {
    try {
      return (await this.delete(
        { path: `/omu/${prisonId}/contact/email` },
        { username: user.username },
      )) as Promise<void>
    } catch (error) {
      return error.status >= 400 && error.status < 500 ? null : error
    }
  }

  async createPrisonLicence(nomsId: string, user: User): Promise<CreateLicenceResponse | null> {
    const response = (await this.post(
      {
        path: `/licence/prison/nomisid/${nomsId}`,
        returnBodyOnErrorIfPredicate: e => e.response.status === 409 || e.response.status === 422,
      },
      { username: user.username },
    )) as Record<string, unknown>

    const { status } = response
    if (status === 409) {
      return { licenceId: response.existingResourceId as number }
    }

    if (status === 422) {
      return null
    }

    return { licenceId: response.licenceId as number }
  }

  async createProbationLicence(nomsId: string, user: User): Promise<CreateLicenceResponse> {
    const response = (await this.post(
      {
        path: `/licence/probation/nomisid/${nomsId}`,
        returnBodyOnErrorIfPredicate: e => e.response.status === 409,
      },
      { username: user.username },
    )) as Record<string, unknown>

    return response.status === 409
      ? { licenceId: response.existingResourceId as number }
      : { licenceId: response.licenceId as number }
  }

  async getLicenceById(licenceId: number, user: User): Promise<Licence> {
    return (await this.get({ path: `/licence/id/${licenceId}` }, { username: user.username })) as Promise<Licence>
  }

  async updateAppointmentPerson(
    licenceId: string,
    appointmentPerson: AppointmentPersonRequest,
    user: User,
  ): Promise<void> {
    await this.put(
      { path: `/licence/id/${licenceId}/appointmentPerson`, data: appointmentPerson },
      { username: user.username },
    )
  }

  async updateAppointmentTime(licenceId: string, appointmentTime: AppointmentTimeRequest, user: User): Promise<void> {
    await this.put(
      { path: `/licence/id/${licenceId}/appointmentTime`, data: appointmentTime },
      { username: user.username },
    )
  }

  async updateAppointmentAddress(
    licenceId: string,
    appointmentAddress: AppointmentAddressRequest,
    user: User,
  ): Promise<void> {
    await this.put(
      { path: `/licence/id/${licenceId}/appointment-address`, data: appointmentAddress },
      { username: user.username },
    )
  }

  async addAppointmentAddress(licenceId: string, appointmentAddress: AddAddressRequest, user: User): Promise<void> {
    await this.put(
      { path: `/licence/id/${licenceId}/appointment/address`, data: appointmentAddress },
      { username: user.username },
    )
  }

  async getPreferredAddresses(user: User): Promise<AddressResponse[]> {
    return (await this.get({ path: `/staff/address/preferred` }, { username: user.username })) as Promise<
      AddressResponse[]
    >
  }

  async deleteAddressByReference(reference: string, user: User): Promise<void> {
    await this.delete({ path: `/staff/address/reference/${reference}` }, { username: user.username })
  }

  async searchForAddresses(requestBody: { searchQuery: string }, user: User): Promise<AddressSearchResponse[]> {
    return (await this.post(
      { path: '/address/search/by/text/', data: requestBody },
      { username: user.username },
    )) as Promise<AddressSearchResponse[]>
  }

  async updateContactNumber(licenceId: string, contactNumberRequest: ContactNumberRequest, user: User): Promise<void> {
    await this.put(
      { path: `/licence/id/${licenceId}/contact-number`, data: contactNumberRequest },
      { username: user.username },
    )
  }

  async updateBespokeConditions(
    licenceId: string,
    bespokeConditions: BespokeConditionsRequest,
    user: User,
  ): Promise<void> {
    await this.put(
      { path: `/licence/id/${licenceId}/bespoke-conditions`, data: bespokeConditions },
      { username: user.username },
    )
  }

  async addAdditionalCondition(
    licenceId: string,
    type: LicenceType,
    additionalCondition: AddAdditionalConditionRequest,
    user: User,
  ): Promise<AdditionalCondition> {
    return (await this.post(
      { path: `/licence/id/${licenceId}/additional-condition/${type}`, data: additionalCondition },
      { username: user.username },
    )) as Promise<AdditionalCondition>
  }

  async deleteAdditionalCondition(conditionId: number, licenceId: number, user: User) {
    await this.delete(
      { path: `/licence/id/${licenceId}/additional-condition/id/${conditionId}` },
      { username: user.username },
    )
  }

  async deleteAdditionalConditionsByCode(conditionCodes: string[], licenceId: number, user: User) {
    await this.post(
      { path: `/licence/id/${licenceId}/delete-additional-conditions-by-code`, data: { conditionCodes } },
      { username: user.username },
    )
  }

  async updateAdditionalConditions(
    licenceId: number,
    additionalConditions: AdditionalConditionsRequest,
    user: User,
  ): Promise<void> {
    await this.put(
      { path: `/licence/id/${licenceId}/additional-conditions`, data: additionalConditions },
      { username: user.username },
    )
  }

  async updateStandardConditions(
    licenceId: string,
    standardConditions: UpdateStandardConditionDataRequest,
    user: User,
  ): Promise<void> {
    await this.put(
      { path: `/licence/id/${licenceId}/standard-conditions`, data: standardConditions },
      { username: user.username },
    )
  }

  async updateAdditionalConditionData(
    licenceId: string,
    additionalConditionId: string,
    additionalConditionData: UpdateAdditionalConditionDataRequest,
    user: User,
  ): Promise<void> {
    await this.put(
      {
        path: `/licence/id/${licenceId}/additional-conditions/condition/${additionalConditionId}`,
        data: additionalConditionData,
      },
      { username: user.username },
    )
  }

  async updateLicenceStatus(licenceId: number, statusRequest: StatusUpdateRequest, user?: User): Promise<void> {
    await this.put({ path: `/licence/id/${licenceId}/status`, data: statusRequest }, { username: user?.username })
  }

  async submitLicence(licenceId: string, body: NotifyRequest[], user: User): Promise<void> {
    await this.put({ path: `/licence/id/${licenceId}/submit`, data: body }, { username: user.username })
  }

  /** @deprecated use a custom api endpoint instead */
  async matchLicences({
    statuses,
    nomisIds,
    sortBy,
    user,
  }: {
    statuses?: string[]
    nomisIds?: string[]
    sortBy?: string
    sortOrder?: string
    user?: User
  }): Promise<LicenceSummary[]> {
    return (await this.post(
      {
        path: `/licence/match`,
        data: {
          status: statuses,
          nomsId: nomisIds,
        },
        query: {
          sortBy: sortBy || undefined,
          sortOrder: undefined,
        },
      },
      { username: user?.username },
    )) as LicenceSummary[]
  }

  async getComReviewCount(user: User): Promise<ComReviewCount> {
    return (await this.get(
      {
        path: `/com/${user.deliusStaffIdentifier}/review-counts`,
      },
      { username: user?.username },
    )) as ComReviewCount
  }

  async batchInActivateLicences(licenceIds: number[]): Promise<void> {
    await this.post({ path: `/licence/inactivate-licences`, data: licenceIds })
  }

  async uploadExclusionZoneFile(
    licenceId: string,
    conditionId: string,
    user: User,
    file: Express.Multer.File,
  ): Promise<void> {
    return (await this.postMultiPart(
      {
        path: `/exclusion-zone/id/${licenceId}/condition/id/${conditionId}/file-upload`,
        fileToUpload: file,
      },
      { username: user?.username },
    )) as void
  }

  // A readable stream for embedding directly in HTML templates
  async getExclusionZoneImage(licenceId: string, conditionId: string, user: User): Promise<Readable> {
    return (await this.stream(
      {
        path: `/exclusion-zone/id/${licenceId}/condition/id/${conditionId}/full-size-image`,
      },
      { username: user?.username },
    )) as Promise<Readable>
  }

  // Raw image data to pass to Gotenberg to render in PDF documents
  async getExclusionZoneImageData(licenceId: string, conditionId: string, user: User): Promise<Buffer> {
    return (await this.get(
      {
        path: `/exclusion-zone/id/${licenceId}/condition/id/${conditionId}/full-size-image`,
        responseType: 'image/jpeg',
      },
      { username: user?.username },
    )) as Promise<Buffer>
  }

  async updateComDetails(updateComRequest: UpdateComRequest): Promise<void> {
    await this.put({ path: `/com/update`, data: updateComRequest })
  }

  async updatePrisonUserDetails(updatePrisonCaseAdminRequest: UpdatePrisonUserRequest): Promise<void> {
    await this.put({ path: `/prison-user/update`, data: updatePrisonCaseAdminRequest })
  }

  async editLicence(licenceId: string, user: User) {
    return (await this.post(
      { path: `/licence/id/${licenceId}/edit` },
      { username: user?.username },
    )) as Promise<EditLicenceResponse>
  }

  async createVariation(licenceId: string, user: User): Promise<CreateVariationResponse> {
    return (await this.post(
      { path: `/licence/id/${licenceId}/create-variation` },
      { username: user?.username },
    )) as Promise<CreateVariationResponse>
  }

  async updateSpoDiscussion(licenceId: string, request: UpdateSpoDiscussionRequest, user: User): Promise<void> {
    await this.put({ path: `/licence/id/${licenceId}/spo-discussion`, data: request }, { username: user?.username })
  }

  async updateVloDiscussion(licenceId: string, request: UpdateVloDiscussionRequest, user: User): Promise<void> {
    await this.put({ path: `/licence/id/${licenceId}/vlo-discussion`, data: request }, { username: user?.username })
  }

  async updateReasonForVariation(
    licenceId: string,
    request: UpdateReasonForVariationRequest,
    user: User,
  ): Promise<void> {
    await this.put(
      { path: `/licence/id/${licenceId}/reason-for-variation`, data: request },
      { username: user?.username },
    )
  }

  async discard(licenceId: string, user: User): Promise<void> {
    await this.delete({ path: `/licence/id/${licenceId}/discard` }, { username: user?.username })
  }

  async recordAuditEvent(auditEvent: AuditEvent, user?: User): Promise<void> {
    await this.put({ path: `/audit/save`, data: auditEvent }, { username: user?.username })
  }

  async getAuditEvents(auditRequest: AuditRequest, user?: User): Promise<AuditEvent[]> {
    return (await this.post(
      {
        path: '/audit/retrieve',
        data: auditRequest,
      },
      { username: user?.username },
    )) as Promise<AuditEvent[]>
  }

  async updatePrisonInformation(
    licenceId: string,
    request: UpdatePrisonInformationRequest,
    user?: User,
  ): Promise<void> {
    await this.put({ path: `/licence/id/${licenceId}/prison-information`, data: request }, { username: user?.username })
  }

  async updateSentenceDates(licenceId: string, user?: User): Promise<void> {
    await this.put({ path: `/licence/id/${licenceId}/sentence-dates` }, { username: user?.username })
  }

  async approveVariation(licenceId: string, user: User): Promise<void> {
    await this.put({ path: `/licence/id/${licenceId}/approve-variation` }, { username: user?.username })
  }

  async activateVariation(licenceId: number, user?: User): Promise<void> {
    await this.put({ path: `/licence/id/${licenceId}/activate-variation` }, { username: user?.username })
  }

  async referVariation(licenceId: string, request: ReferVariationRequest, user: User): Promise<void> {
    await this.put({ path: `/licence/id/${licenceId}/refer-variation`, data: request }, { username: user?.username })
  }

  async matchLicenceEvents(
    licenceId: string,
    eventTypes: string[] = [],
    sortBy?: string,
    sortOrder?: string,
    user?: User,
  ): Promise<LicenceEvent[]> {
    return (await this.get(
      {
        path: `/events/match`,
        query: {
          licenceId,
          eventType: eventTypes,
          sortBy: sortBy || undefined,
          sortOrder: sortOrder || undefined,
        },
      },
      { username: user?.username },
    )) as LicenceEvent[]
  }

  async getLicencePolicyForVersion(version: string): Promise<LicencePolicyResponse> {
    try {
      return (await this.get({ path: `/licence-policy/version/${version}` })) as Promise<LicencePolicyResponse>
    } catch (error) {
      return error.status >= 400 && error.status < 500 ? null : error
    }
  }

  async getActiveLicencePolicy(): Promise<LicencePolicyResponse> {
    try {
      return (await this.get({ path: `/licence-policy/active` })) as Promise<LicencePolicyResponse>
    } catch (error) {
      return error.status >= 400 && error.status < 500 ? null : error
    }
  }

  async getPolicyChanges(licenceId: string, activePolicyVersion: string): Promise<LicenceConditionChange[]> {
    return (await this.get({ path: `/licence-policy/compare/${activePolicyVersion}/licence/${licenceId}` })) as Promise<
      LicenceConditionChange[]
    >
  }

  async overrideStatusCode(licenceId: number, request: { reason: string; statusCode: LicenceStatus }, user: User) {
    await this.post({ path: `/licence/id/${licenceId}/override/status`, data: request }, { username: user?.username })
  }

  async overrideLicenceDates(licenceId: number, request: OverrideLicenceDatesRequest, user: User) {
    await this.put({ path: `/licence/id/${licenceId}/override/dates`, data: request }, { username: user?.username })
  }

  async overrideLicenceType(
    licenceId: number,
    request: OverrideLicenceTypeRequest,
    user: User,
  ): Promise<Record<string, string>> {
    const response = (await this.post(
      {
        path: `/licence/id/${licenceId}/override/type`,
        data: request,
        returnBodyOnErrorIfPredicate: e => e.response.status === 400,
      },
      { username: user?.username },
    )) as Record<string, unknown>
    return response.status === 400 ? (response.fieldErrors as Record<string, string>) : null
  }

  async overrideLicencePrisonerDetails(licenceId: number, request: OverrideLicencePrisonerDetailsRequest, user: User) {
    await this.post(
      { path: `/licence/id/${licenceId}/override/prisoner-details`, data: request },
      { username: user?.username },
    )
  }

  async updateOffenderDetails(nomisId: string, offenderDetails: UpdateOffenderDetailsRequest) {
    await this.put({
      path: `/offender/nomisid/${nomisId}/update-offender-details`,
      data: offenderDetails,
    })
  }

  async searchForOffenderOnStaffCaseload(
    searchRequest: ProbationSearchRequest,
    user: User,
  ): Promise<ComSearchResponse> {
    return (await this.post(
      {
        path: `/caseload/com/case-search`,
        data: searchRequest,
      },
      { username: user.username },
    )) as Promise<ComSearchResponse>
  }

  async getParentLicenceOrSelf(licenceId: number, user: User): Promise<Licence> {
    const licence = await this.getLicenceById(licenceId, user)
    if (!isVariation(licence)) {
      return licence
    }

    return this.getLicenceById(licence.variationOf, user)
  }

  async getBankHolidaysForEnglandAndWales(): Promise<string[]> {
    return (await this.get({
      path: '/bank-holidays',
    })) as Promise<string[]>
  }

  async reviewWithoutVariation(licenceId: number, user: User): Promise<void> {
    await this.post(
      {
        path: `/licence/id/${licenceId}/review-with-no-variation-required`,
      },
      { username: user.username },
    )
  }

  async getPrisonerDetail(nomsId: string, user: User): Promise<PrisonerWithCvlFields> {
    return (await this.get(
      { path: `/prisoner-search/nomisid/${nomsId}` },
      { username: user.username },
    )) as Promise<PrisonerWithCvlFields>
  }

  async deactivateActiveAndVariationLicences(licenceId: number, reason: string): Promise<void> {
    await this.post({
      path: `/licence/id/${licenceId}/deactivate-licence-and-variations`,
      data: {
        reason,
      },
    })
  }

  async getApprovalCaseload(prisons?: string[], user?: User): Promise<ApprovalCase[]> {
    if (prisons.length < 1) {
      return []
    }
    return (await this.post(
      {
        path: `/caseload/prison-approver/approval-needed`,
        data: prisons,
      },
      { username: user?.username },
    )) as Promise<ApprovalCase[]>
  }

  async getRecentlyApprovedCaseload(prisons?: string[], user?: User): Promise<ApprovalCase[]> {
    if (prisons.length < 1) {
      return []
    }
    return (await this.post(
      {
        path: `/caseload/prison-approver/recently-approved`,
        data: prisons,
      },
      { username: user?.username },
    )) as Promise<ApprovalCase[]>
  }

  async searchForOffenderOnApproverCaseload(searchRequest: ApproverSearchRequest): Promise<ApproverSearchResponse> {
    return (await this.post({
      path: `/caseload/prison-approver/case-search`,
      data: searchRequest,
    })) as Promise<ApproverSearchResponse>
  }

  async getPrisonOmuCaseload(caCaseloadSearch: CaCaseloadSearch, user?: User): Promise<CaCase[]> {
    return (await this.post(
      {
        path: `/caseload/case-admin/prison-view`,
        data: caCaseloadSearch,
      },
      { username: user?.username },
    )) as Promise<CaCase[]>
  }

  async getTimeServedCases(prisonCode: string, user?: User): Promise<TimeServedCaseload> {
    return (await this.post(
      {
        path: `/cases/time-served/${prisonCode}`,
      },
      { username: user?.username },
    )) as Promise<TimeServedCaseload>
  }

  async getProbationOmuCaseload(caCaseloadSearch: CaCaseloadSearch, user?: User): Promise<CaCase[]> {
    return (await this.post(
      {
        path: `/caseload/case-admin/probation-view`,
        data: caCaseloadSearch,
      },
      { username: user?.username },
    )) as Promise<CaCase[]>
  }

  async getStaffCreateCaseload(user: User): Promise<ComCreateCase[]> {
    return (await this.get(
      {
        path: `/caseload/com/staff/${user?.deliusStaffIdentifier}/create-case-load`,
      },
      { username: user.username },
    )) as Promise<ComCreateCase[]>
  }

  async getTeamCreateCaseload(teamCaseloadRequest: TeamCaseloadRequest, user: User): Promise<ComCreateCase[]> {
    return (await this.post(
      {
        path: `/caseload/com/team/create-case-load`,
        data: teamCaseloadRequest,
      },
      { username: user.username },
    )) as Promise<ComCreateCase[]>
  }

  async getStaffVaryCaseload(user: User): Promise<ComVaryCase[]> {
    return (await this.get(
      {
        path: `/caseload/com/staff/${user?.deliusStaffIdentifier}/vary-case-load`,
      },
      { username: user.username },
    )) as Promise<ComVaryCase[]>
  }

  async getTeamVaryCaseload(teamCaseloadRequest: TeamCaseloadRequest, user: User): Promise<ComVaryCase[]> {
    return (await this.post(
      {
        path: `/caseload/com/team/vary-case-load`,
        data: teamCaseloadRequest,
      },
      { username: user.username },
    )) as Promise<ComVaryCase[]>
  }

  async getVaryApproverCaseload(
    varyApproverCaseloadRequest: VaryApproverCaseloadSearchRequest,
    user: User,
  ): Promise<VaryApproverCase[]> {
    return (await this.post(
      {
        path: `/caseload/vary-approver`,
        data: varyApproverCaseloadRequest,
      },
      { username: user.username },
    )) as Promise<VaryApproverCase[]>
  }

  async searchForOffenderOnVaryApproverCaseload(
    searchRequest: VaryApproverCaseloadSearchRequest,
    user: User,
  ): Promise<VaryApproverCaseloadSearchResponse> {
    return (await this.post(
      {
        path: `/caseload/vary-approver/case-search`,
        data: searchRequest,
      },
      { username: user.username },
    )) as Promise<VaryApproverCaseloadSearchResponse>
  }

  async getHdcLicenceData(licenceId: number): Promise<HdcLicenceData> {
    return (await this.get({
      path: `/hdc/curfew/licenceId/${licenceId}`,
    })) as Promise<HdcLicenceData>
  }

  async getIneligibilityReasons(nomisId: string): Promise<EligibilityAssessment> {
    return (await this.get({
      path: `/offender/nomisid/${nomisId}/ineligibility-reasons`,
    })) as Promise<EligibilityAssessment>
  }

  async getIS91Status(nomisId: string): Promise<boolean> {
    return (await this.get({
      path: `/offender/nomisid/${nomisId}/is-91-status`,
    })) as Promise<boolean>
  }

  async getLastMinuteCases(): Promise<LastMinuteHandoverCaseResponse[]> {
    return (await this.get({
      path: `/cvl-report/last-minute-handover-cases`,
    })) as Promise<LastMinuteHandoverCaseResponse[]>
  }

  async getUpcomingReleasesWithMonitoring(): Promise<UpcomingReleasesWithMonitoringConditionsResponse[]> {
    return (await this.get({
      path: `/cvl-report/upcoming-releases-with-monitoring`,
    })) as Promise<UpcomingReleasesWithMonitoringConditionsResponse[]>
  }

  async searchForOffenderOnPrisonCaseAdminCaseload(
    searchRequest: PrisonUserSearchRequest,
  ): Promise<PrisonCaseAdminSearchResult> {
    return (await this.post({
      path: `/caseload/case-admin/case-search`,
      data: searchRequest,
    })) as Promise<PrisonCaseAdminSearchResult>
  }

  async updateElectronicMonitoringProgramme(licenceId: number, request: UpdateElectronicMonitoringProgrammeRequest) {
    await this.post({ path: `/licence/id/${licenceId}/electronic-monitoring-programmes`, data: request })
  }

  async syncComAllocation(crn: string, user?: User): Promise<void> {
    await this.put({ path: `/offender/sync-com/crn/${crn}` }, { username: user?.username })
  }

  async getLicencePermissions(
    licenceId: number,
    request: LicencePermissionsRequest,
    user: User,
  ): Promise<LicencePermissionsResponse> {
    return (await this.post(
      { path: `/licence/id/${licenceId}/permissions`, data: request },
      { username: user.username },
    )) as Promise<LicencePermissionsResponse>
  }

  async updateTimeServedExternalRecord(
    nomisId: string,
    bookingId: number,
    request: ExternalTimeServedRecordRequest,
    user: User,
  ): Promise<void> {
    return (await this.put(
      { path: `/time-served/external-records/${nomisId}/${bookingId}`, data: request },
      { username: user?.username },
    )) as Promise<void>
  }

  async getTimeServedExternalRecord(
    nomisId: string,
    bookingId: number,
    user: User,
  ): Promise<ExternalTimeServedRecordResponse | null> {
    return (await this.get(
      { path: `/time-served/external-records/${nomisId}/${bookingId}`, return404: true },
      { username: user?.username },
    )) as Promise<ExternalTimeServedRecordResponse | null>
  }

  async addTimeServedProbationConfirmContact(
    licenceId: number,
    request: TimeServedProbationConfirmContactRequest,
    user: User,
  ): Promise<void> {
    return (await this.put(
      { path: `/licences/time-served/${licenceId}/confirm/probation-contact`, data: request },
      { username: user?.username },
    )) as Promise<void>
  }

  async updateCurfewTimes(licenceId: number, request: CurfewTimesRequest, user: User): Promise<void> {
    return (await this.put(
      { path: `/licence/id/${licenceId}/curfew-times`, data: request },
      { username: user?.username },
    )) as Promise<void>
  }

  async getCaseAccessDetails(crn: string, user: User): Promise<CaseAccessDetails> {
    return (await this.get(
      { path: `/probation-staff/${crn}/permissions` },
      { username: user?.username },
    )) as Promise<CaseAccessDetails>
  }

  async checkComCaseAccess(request: CheckCaseAccessRequest, user: User): Promise<CaseAccessDetails> {
    return (await this.post(
      {
        path: `/probation-staff/case-access`,
        data: request,
      },
      { username: user.username },
    )) as CaseAccessDetails
  }
}
