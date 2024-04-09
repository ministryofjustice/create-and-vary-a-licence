import { Readable } from 'stream'
import RestClient from './hmppsRestClient'
import type {
  ContactNumberRequest,
  CreateLicenceRequest,
  LicenceSummary,
  Licence,
  LicenceEvent,
  AppointmentPersonRequest,
  AppointmentTimeRequest,
  AppointmentAddressRequest,
  AuditEvent,
  AuditRequest,
  BespokeConditionsRequest,
  StatusUpdateRequest,
  AdditionalConditionsRequest,
  UpdateAdditionalConditionDataRequest,
  UpdateSpoDiscussionRequest,
  UpdateVloDiscussionRequest,
  UpdateReasonForVariationRequest,
  UpdatePrisonInformationRequest,
  UpdateSentenceDatesRequest,
  ReferVariationRequest,
  EmailContact,
  UpdateProbationTeamRequest,
  NotifyRequest,
  UpdateStandardConditionDataRequest,
  OmuContact,
  LicenceConditionChange,
  AdditionalCondition,
  AddAdditionalConditionRequest,
  LicencePolicyResponse,
  OverrideLicenceDatesRequest,
  UpdateOffenderDetailsRequest,
  ProbationSearchRequest,
  ProbationSearchResult,
  CaseloadItem,
  LicenceSummaryApproverView,
  LicenceCreationResponse,
} from '../@types/licenceApiClientTypes'
import config, { ApiConfig } from '../config'
import { User } from '../@types/CvlUserDetails'
import {
  UpdateComRequest,
  UpdatePrisonUserRequest,
  HardStopCutoffDate,
  ComReviewCount,
} from '../@types/licenceApiClientTypes'
import LicenceType from '../enumeration/licenceType'
import LicenceStatus from '../enumeration/licenceStatus'
import type { TokenStore } from './tokenStore'
import logger from '../../logger'

export default class LicenceApiClient extends RestClient {
  constructor(tokenStore: TokenStore) {
    super(tokenStore, 'Licence API', config.apis.licenceApi as ApiConfig)
  }

  async getOmuEmail(prisonId: string, user: User): Promise<OmuContact | null> {
    try {
      return (await this.get(
        { path: `/omu/${prisonId}/contact/email` },
        { username: user.username }
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
        { username: user.username }
      )) as Promise<OmuContact>
    } catch (error) {
      return error.status >= 400 && error.status < 500 ? null : error
    }
  }

  async deleteOmuEmailAddress(prisonId: string, user: User): Promise<void> {
    try {
      return (await this.delete(
        { path: `/omu/${prisonId}/contact/email` },
        { username: user.username }
      )) as Promise<void>
    } catch (error) {
      return error.status >= 400 && error.status < 500 ? null : error
    }
  }

  async createLicence(licence: CreateLicenceRequest, user: User): Promise<LicenceCreationResponse> {
    return (await this.post(
      {
        path: `/licence/create`,
        data: licence,
      },
      { username: user.username }
    )) as Promise<LicenceSummary>
  }

  async getLicenceById(licenceId: number, user: User): Promise<Licence> {
    return (await this.get({ path: `/licence/id/${licenceId}` }, { username: user.username })) as Promise<Licence>
  }

  async updateAppointmentPerson(
    licenceId: string,
    appointmentPerson: AppointmentPersonRequest,
    user: User
  ): Promise<void> {
    await this.put(
      { path: `/licence/id/${licenceId}/appointmentPerson`, data: appointmentPerson },
      { username: user.username }
    )
  }

  async updateAppointmentTime(licenceId: string, appointmentTime: AppointmentTimeRequest, user: User): Promise<void> {
    await this.put(
      { path: `/licence/id/${licenceId}/appointmentTime`, data: appointmentTime },
      { username: user.username }
    )
  }

  async updateAppointmentAddress(
    licenceId: string,
    appointmentAddress: AppointmentAddressRequest,
    user: User
  ): Promise<void> {
    await this.put(
      { path: `/licence/id/${licenceId}/appointment-address`, data: appointmentAddress },
      { username: user.username }
    )
  }

  async updateContactNumber(licenceId: string, contactNumber: ContactNumberRequest, user: User): Promise<void> {
    await this.put(
      { path: `/licence/id/${licenceId}/contact-number`, data: contactNumber },
      { username: user.username }
    )
  }

  async updateBespokeConditions(
    licenceId: string,
    bespokeConditions: BespokeConditionsRequest,
    user: User
  ): Promise<void> {
    await this.put(
      { path: `/licence/id/${licenceId}/bespoke-conditions`, data: bespokeConditions },
      { username: user.username }
    )
  }

  async addAdditionalCondition(
    licenceId: string,
    type: LicenceType,
    additionalCondition: AddAdditionalConditionRequest,
    user: User
  ): Promise<AdditionalCondition> {
    return (await this.post(
      { path: `/licence/id/${licenceId}/additional-condition/${type}`, data: additionalCondition },
      { username: user.username }
    )) as Promise<AdditionalCondition>
  }

  async deleteAdditionalCondition(conditionId: number, licenceId: number, user: User) {
    await this.delete(
      { path: `/licence/id/${licenceId}/additional-condition/id/${conditionId}` },
      { username: user.username }
    )
  }

  async updateAdditionalConditions(
    licenceId: number,
    additionalConditions: AdditionalConditionsRequest,
    user: User
  ): Promise<void> {
    await this.put(
      { path: `/licence/id/${licenceId}/additional-conditions`, data: additionalConditions },
      { username: user.username }
    )
  }

  async updateStandardConditions(
    licenceId: string,
    standardConditions: UpdateStandardConditionDataRequest,
    user: User
  ): Promise<void> {
    await this.put(
      { path: `/licence/id/${licenceId}/standard-conditions`, data: standardConditions },
      { username: user.username }
    )
  }

  async updateAdditionalConditionData(
    licenceId: string,
    additionalConditionId: string,
    additionalConditionData: UpdateAdditionalConditionDataRequest,
    user: User
  ): Promise<void> {
    await this.put(
      {
        path: `/licence/id/${licenceId}/additional-conditions/condition/${additionalConditionId}`,
        data: additionalConditionData,
      },
      { username: user.username }
    )
  }

  async updateLicenceStatus(licenceId: number, statusRequest: StatusUpdateRequest, user?: User): Promise<void> {
    await this.put({ path: `/licence/id/${licenceId}/status`, data: statusRequest }, { username: user?.username })
  }

  async submitLicence(licenceId: string, body: NotifyRequest[], user: User): Promise<void> {
    await this.put({ path: `/licence/id/${licenceId}/submit`, data: body }, { username: user.username })
  }

  async matchLicences(
    statuses?: string[],
    prisons?: string[],
    staffIds?: number[],
    nomisIds?: string[],
    pdus?: string[],
    sortBy?: string,
    sortOrder?: string,
    user?: User,
    probationAreaCodes?: string[]
  ): Promise<LicenceSummary[]> {
    return (await this.post(
      {
        path: `/licence/match`,
        data: {
          prison: prisons,
          status: statuses,
          staffId: staffIds,
          nomsId: nomisIds,
          pdu: pdus,
          probationAreaCodes,
        },
        query: {
          sortBy: sortBy || undefined,
          sortOrder: sortOrder || undefined,
        },
      },
      { username: user?.username }
    )) as LicenceSummary[]
  }

  async getCutOffDateForLicenceTimeOut(user: User): Promise<HardStopCutoffDate> {
    return (await this.get(
      {
        path: `/current-hard-stop-cutoff-date`,
      },
      { username: user?.username }
    )) as HardStopCutoffDate
  }

  async getComReviewCount(user: User): Promise<ComReviewCount> {
    return (await this.get(
      {
        path: `/com/${user.deliusStaffIdentifier}/review-counts`,
      },
      { username: user?.username }
    )) as ComReviewCount
  }

  async getLicencesForApproval(prisons?: string[], user?: User): Promise<LicenceSummaryApproverView[]> {
    return (await this.post(
      {
        path: `/licences-for-approval`,
        data: {
          prisonCodes: prisons,
        },
      },
      { username: user?.username }
    )) as LicenceSummaryApproverView[]
  }

  async getLicencesRecentlyApproved(prisons?: string[], user?: User): Promise<LicenceSummaryApproverView[]> {
    return (await this.post(
      {
        path: `/licence/recently-approved`,
        data: {
          prisonCodes: prisons,
        },
      },
      { username: user?.username }
    )) as LicenceSummary[]
  }

  async batchInActivateLicences(licenceIds: number[]): Promise<void> {
    await this.post({ path: `/licence/inactivate-licences`, data: licenceIds })
  }

  async uploadExclusionZoneFile(
    licenceId: string,
    conditionId: string,
    user: User,
    file: Express.Multer.File
  ): Promise<void> {
    return (await this.postMultiPart(
      {
        path: `/exclusion-zone/id/${licenceId}/condition/id/${conditionId}/file-upload`,
        fileToUpload: file,
      },
      { username: user?.username }
    )) as void
  }

  async removeExclusionZoneFile(licenceId: string, conditionId: string, user: User): Promise<void> {
    return (await this.put(
      {
        path: `/exclusion-zone/id/${licenceId}/condition/id/${conditionId}/remove-upload`,
      },
      { username: user?.username }
    )) as void
  }

  // A readable stream for embedding directly in HTML templates
  async getExclusionZoneImage(licenceId: string, conditionId: string, user: User): Promise<Readable> {
    return (await this.stream(
      {
        path: `/exclusion-zone/id/${licenceId}/condition/id/${conditionId}/full-size-image`,
      },
      { username: user?.username }
    )) as Promise<Readable>
  }

  // Raw image data to pass to Gotenberg to render in PDF documents
  async getExclusionZoneImageData(licenceId: string, conditionId: string, user: User): Promise<Buffer> {
    return (await this.get(
      {
        path: `/exclusion-zone/id/${licenceId}/condition/id/${conditionId}/full-size-image`,
        responseType: 'image/jpeg',
      },
      { username: user?.username }
    )) as Promise<Buffer>
  }

  async updateResponsibleCom(crn: string, updateResponsibleComRequest: UpdateComRequest): Promise<void> {
    await this.put({ path: `/offender/crn/${crn}/responsible-com`, data: updateResponsibleComRequest })
  }

  async updateProbationTeam(crn: string, updateProbationTeamRequest: UpdateProbationTeamRequest): Promise<void> {
    await this.put({ path: `/offender/crn/${crn}/probation-team`, data: updateProbationTeamRequest })
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
      { username: user?.username }
    )) as Promise<LicenceSummary>
  }

  async createVariation(licenceId: string, user: User): Promise<LicenceSummary> {
    return (await this.post(
      { path: `/licence/id/${licenceId}/create-variation` },
      { username: user?.username }
    )) as Promise<LicenceSummary>
  }

  async submittedVariationsByProbationArea(probationAreaCode: string, user: User) {
    return (await this.get(
      {
        path: `/licence/variations/submitted/area/${probationAreaCode}`,
      },
      { username: user?.username }
    )) as LicenceSummary[]
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
    user: User
  ): Promise<void> {
    await this.put(
      { path: `/licence/id/${licenceId}/reason-for-variation`, data: request },
      { username: user?.username }
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
      { username: user?.username }
    )) as Promise<AuditEvent[]>
  }

  async updatePrisonInformation(
    licenceId: string,
    request: UpdatePrisonInformationRequest,
    user?: User
  ): Promise<void> {
    await this.put({ path: `/licence/id/${licenceId}/prison-information`, data: request }, { username: user?.username })
  }

  async updateSentenceDates(licenceId: string, request: UpdateSentenceDatesRequest, user?: User): Promise<void> {
    await this.put({ path: `/licence/id/${licenceId}/sentence-dates`, data: request }, { username: user?.username })
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

  async notifyComsToPromptEmailCreation(request: EmailContact[]): Promise<void> {
    await this.post({ path: `/com/prompt-licence-creation`, data: request })
  }

  async matchLicenceEvents(
    licenceId: string,
    // eslint-disable-next-line default-param-last
    eventTypes: string[] = [],
    sortBy?: string,
    sortOrder?: string,
    user?: User
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
      { username: user?.username }
    )) as LicenceEvent[]
  }

  async getLicencePolicyForVersion(version: string): Promise<LicencePolicyResponse> {
    try {
      return this.get({ path: `/licence-policy/version/${version}` }) as Promise<LicencePolicyResponse>
    } catch (error) {
      return error.status >= 400 && error.status < 500 ? null : error
    }
  }

  async getActiveLicencePolicy(): Promise<LicencePolicyResponse> {
    try {
      return this.get({ path: `/licence-policy/active` }) as Promise<LicencePolicyResponse>
    } catch (error) {
      return error.status >= 400 && error.status < 500 ? null : error
    }
  }

  async getPolicyChanges(licenceId: string, activePolicyVersion: string): Promise<LicenceConditionChange[]> {
    return this.get({ path: `/licence-policy/compare/${activePolicyVersion}/licence/${licenceId}` }) as Promise<
      LicenceConditionChange[]
    >
  }

  async notifyProbationPractionerOfEditedLicencesStillUnapprovedOnCrd(): Promise<void> {
    await this.post({
      path: '/notify-probation-of-unapproved-licences',
    })
  }

  async overrideStatusCode(licenceId: number, request: { reason: string; statusCode: LicenceStatus }, user: User) {
    await this.post({ path: `/licence/id/${licenceId}/override/status`, data: request }, { username: user?.username })
  }

  async runLicenceActivationJob() {
    await this.post({
      path: '/run-activation-job',
    })
  }

  async runRemoveExpiredConditionsJob() {
    await this.post({
      path: '/run-remove-expired-conditions-job',
    })
  }

  async runLicenceTimeOutJob() {
    await this.post({
      path: '/run-time-out-job',
    })
  }

  async overrideLicenceDates(licenceId: number, request: OverrideLicenceDatesRequest, user: User) {
    await this.put({ path: `/licence/id/${licenceId}/override/dates`, data: request }, { username: user?.username })
  }

  async updateOffenderDetails(nomisId: string, offenderDetails: UpdateOffenderDetailsRequest) {
    await this.put({
      path: `/offender/nomisid/${nomisId}/update-offender-details`,
      data: offenderDetails,
    })
  }

  async searchForOffenderOnStaffCaseload(searchRequest: ProbationSearchRequest): Promise<ProbationSearchResult> {
    return (await this.post({
      path: `/com/case-search`,
      data: searchRequest,
    })) as Promise<ProbationSearchResult>
  }

  async getParentLicenceOrSelf(licenceId: number, user: User): Promise<Licence> {
    const licence = await this.getLicenceById(licenceId, user)
    if (licence.kind !== 'VARIATION') {
      return licence
    }

    return this.getLicenceById(licence.variationOf, user)
  }

  async getBankHolidaysForEnglandAndWales(): Promise<string[]> {
    return (await this.get({
      path: '/bank-holidays',
    })) as Promise<string[]>
  }

  async runLicenceExpiryJob(): Promise<void> {
    await this.post({
      path: '/run-expire-licences-job',
    })
  }

  async runDeactivateReleaseDatePassedLicencesJob(): Promise<void> {
    await this.post({
      path: '/run-deactivate-licences-past-release-date',
    })
  }

  async reviewWithoutVariation(licenceId: number): Promise<void> {
    await this.post({
      path: `/licence/id/${licenceId}/review-with-no-variation-required`,
    })
  }

  async getPrisonerDetail(nomsId: string, user: User): Promise<CaseloadItem> {
    return (await this.get(
      { path: `/prisoner-search/nomisid/${nomsId}` },
      { username: user.username }
    )) as Promise<CaseloadItem>
  }
}
