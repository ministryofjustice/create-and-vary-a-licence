import { Readable } from 'stream'
import fs from 'fs'
import _ from 'lodash'
import { format } from 'date-fns'
import type {
  AddAdditionalConditionRequest,
  AdditionalCondition,
  AdditionalConditionsRequest,
  AppointmentAddressRequest,
  AppointmentPersonRequest,
  AppointmentTimeRequest,
  AuditEvent,
  AuditRequest,
  BespokeConditionsRequest,
  CaseAccessDetails,
  CheckCaseAccessRequest,
  ComReviewCount,
  ContactNumberRequest,
  CreateLicenceResponse,
  CreateVariationResponse,
  EditLicenceResponse,
  EligibilityAssessment,
  LastMinuteHandoverCaseResponse,
  Licence,
  LicenceConditionChange,
  LicenceSummary,
  NotifyRequest,
  PrisonerWithCvlFields,
  ReferVariationRequest,
  StatusUpdateRequest,
  UpcomingReleasesWithMonitoringConditionsResponse,
  UpdateAdditionalConditionDataRequest,
  UpdateComRequest,
  UpdateElectronicMonitoringProgrammeRequest,
  UpdatePrisonInformationRequest,
  UpdatePrisonUserRequest,
  UpdateReasonForVariationRequest,
  UpdateSpoDiscussionRequest,
  UpdateStandardConditionDataRequest,
  UpdateVloDiscussionRequest,
} from '../@types/licenceApiClientTypes'
import { OmuContact, UpdateOffenderDetailsRequest } from '../@types/licenceApiClientTypes'
import LicenceApiClient from '../data/licenceApiClient'
import PersonName from '../routes/initialAppointment/types/personName'
import DateTime from '../routes/initialAppointment/types/dateTime'
import TelephoneNumbers from '../routes/initialAppointment/types/telephoneNumbers'
import Address from '../routes/initialAppointment/types/address'
import { addressObjectToString, isVariation, objectIsEmpty } from '../utils/utils'
import BespokeConditions from '../routes/manageConditions/types/bespokeConditions'
import LicenceStatus from '../enumeration/licenceStatus'
import AdditionalConditions from '../routes/manageConditions/types/additionalConditions'
import Stringable from '../routes/creatingLicences/types/abstract/stringable'
import LicenceType from '../enumeration/licenceType'
import { User } from '../@types/CvlUserDetails'
import compareLicenceConditions, { VariedConditions } from '../utils/licenceComparator'
import ApprovalComment from '../@types/ApprovalComment'
import LicenceEventType from '../enumeration/licenceEventType'
import ConditionService from './conditionService'

export default class LicenceService {
  constructor(
    private readonly licenceApiClient: LicenceApiClient,
    private readonly conditionService: ConditionService,
  ) {}

  async createPrisonLicence(nomsId: string, user: User): Promise<CreateLicenceResponse> {
    return this.licenceApiClient.createPrisonLicence(nomsId, user)
  }

  async createProbationLicence(nomsId: string, user: User): Promise<CreateLicenceResponse> {
    return this.licenceApiClient.createProbationLicence(nomsId, user)
  }

  async getLicence(id: number, user: User): Promise<Licence> {
    return this.licenceApiClient.getLicenceById(id, user)
  }

  async getPolicyChanges(id: string): Promise<LicenceConditionChange[]> {
    const activePolicyVersion = await this.conditionService.getPolicyVersion()
    return this.licenceApiClient.getPolicyChanges(id, activePolicyVersion)
  }

  async updateAppointmentPerson(id: string, formData: PersonName, user: User): Promise<void> {
    const requestBody = {
      appointmentPersonType: formData.appointmentPersonType || 'SPECIFIC_PERSON',
      appointmentPerson: formData.contactName,
    } as AppointmentPersonRequest

    return this.licenceApiClient.updateAppointmentPerson(id, requestBody, user)
  }

  async updateAppointmentTime(id: string, formData: DateTime, user: User): Promise<void> {
    const { appointmentTimeType } = formData
    const appointmentTime = (appointmentTimeType === 'SPECIFIC_DATE_TIME' && DateTime.toJson(formData)) || null
    const requestBody = { appointmentTime, appointmentTimeType } as AppointmentTimeRequest
    return this.licenceApiClient.updateAppointmentTime(id, requestBody, user)
  }

  async updateAppointmentAddress(id: string, formData: Address, user: User): Promise<void> {
    const appointmentAddress = addressObjectToString(formData)
    const requestBody = { appointmentAddress } as AppointmentAddressRequest
    return this.licenceApiClient.updateAppointmentAddress(id, requestBody, user)
  }

  async updateContactNumber(id: string, formData: TelephoneNumbers, user: User): Promise<void> {
    const requestBody: ContactNumberRequest = {
      telephone: formData.telephone,
      telephoneAlternative: formData.telephoneAlternative,
    }
    return this.licenceApiClient.updateContactNumber(id, requestBody, user)
  }

  async addAdditionalCondition(
    licenceId: string,
    conditionType: LicenceType,
    formData: AddAdditionalConditionRequest,
    user: User,
  ) {
    return this.licenceApiClient.addAdditionalCondition(licenceId, conditionType, formData, user)
  }

  async deleteAdditionalCondition(conditionId: number, licenceId: number, user: User) {
    return this.licenceApiClient.deleteAdditionalCondition(conditionId, licenceId, user)
  }

  async deleteAdditionalConditionsByCode(conditionCodes: string[], licenceId: number, user: User): Promise<void> {
    await this.licenceApiClient.deleteAdditionalConditionsByCode(conditionCodes, licenceId, user)
  }

  async updateAdditionalConditions(
    id: number,
    conditionType: LicenceType,
    formData: AdditionalConditions,
    user: User,
    licenceVersion: string,
  ): Promise<void> {
    const additionalConditions =
      formData.additionalConditions?.map(async (conditionCode, index) => {
        const additionalConditionConfig = await this.conditionService.getAdditionalConditionByCode(
          conditionCode,
          licenceVersion,
        )
        return {
          code: conditionCode,
          sequence: index,
          category: additionalConditionConfig?.categoryShort || additionalConditionConfig?.category,
          text: additionalConditionConfig?.text,
        }
      }) || []

    const requestBody = {
      additionalConditions: await Promise.all(additionalConditions),
      conditionType,
    } as AdditionalConditionsRequest

    return this.licenceApiClient.updateAdditionalConditions(id, requestBody, user)
  }

  async updateAdditionalConditionData(
    licenceId: string,
    condition: AdditionalCondition,
    formData: Record<string, unknown>,
    user: User,
  ): Promise<void> {
    let sequenceNumber = -1

    const enteredData = Object.keys(formData)
      .filter(key => !['_csrf', 'code'].includes(key) && formData[key] && !objectIsEmpty(formData[key]))
      .flatMap((key, index) => {
        // The POST request to the API will only accept an array of objects where value is a string.
        // Therefore, if the type of data entered from the form is an array or an object, we need to convert that to a string type.
        // For arrays, we can just split it into multiple objects each with a value from each member of that array.
        // For objects, the objects needs to be converted into a string representation. Types which need to be represented as a string
        // should extend Stringable and implement the stringify() method

        const build = (value: unknown, i?: number) => {
          return {
            field: key,
            value: value instanceof Stringable ? value.stringify() : value,
            sequence: i || index,
          }
        }

        if (Array.isArray(formData[key])) {
          return formData[key]
            .filter((v: string) => v)
            .map((v: string) => {
              sequenceNumber += 1
              return build(v, sequenceNumber)
            })
        }
        sequenceNumber += 1
        return build(formData[key], sequenceNumber)
      })

    const requestBody = {
      data: enteredData,
    } as UpdateAdditionalConditionDataRequest

    return this.licenceApiClient.updateAdditionalConditionData(licenceId, condition.id.toString(), requestBody, user)
  }

  async uploadExclusionZoneFile(
    licenceId: string,
    additionalConditionId: string,
    fileToUpload: Express.Multer.File,
    user: User,
    testMode = false,
  ): Promise<void> {
    await this.licenceApiClient.uploadExclusionZoneFile(licenceId, additionalConditionId, user, fileToUpload)
    if (!testMode) {
      fs.unlinkSync(fileToUpload.path)
    }
  }

  // Get the streamed image data for rendering in HTML templates
  async getExclusionZoneImage(licenceId: string, conditionId: string, user: User): Promise<Readable> {
    return this.licenceApiClient.getExclusionZoneImage(licenceId, conditionId, user)
  }

  // Get base64 image data to be passed into Gotenberg for rendering in into PDFs
  async getExclusionZoneImageData(licenceId: string, conditionId: string, user: User): Promise<string> {
    const image = await this.licenceApiClient.getExclusionZoneImageData(licenceId, conditionId, user)
    return image.toString('base64')
  }

  async updateBespokeConditions(id: string, formData: BespokeConditions, user: User): Promise<void> {
    const sanitised = formData.conditions.filter((c: string) => c && c.length > 0)
    const requestBody = { conditions: sanitised } as BespokeConditionsRequest
    return this.licenceApiClient.updateBespokeConditions(id, requestBody, user)
  }

  async updateStandardConditions(id: string, data: UpdateStandardConditionDataRequest, user: User): Promise<void> {
    await this.licenceApiClient.updateStandardConditions(id, data, user)
  }

  async updateStatus(id: number, newStatus: LicenceStatus, user?: User): Promise<void> {
    const requestBody = {
      status: newStatus,
      username: user?.username || 'SYSTEM',
      fullName: user?.displayName || 'SYSTEM',
    } as StatusUpdateRequest
    return this.licenceApiClient.updateLicenceStatus(id, requestBody, user)
  }

  async activateVariation(id: number, user?: User): Promise<void> {
    return this.licenceApiClient.activateVariation(id, user)
  }

  async submitLicence(id: string, user: User): Promise<void> {
    return this.licenceApiClient.submitLicence(id, [], user)
  }

  async submitVariation(id: string, notifyDetails: NotifyRequest[], user: User): Promise<void> {
    return this.licenceApiClient.submitLicence(id, notifyDetails, user)
  }

  async getLicencesByNomisIdsAndStatus(
    nomisIds: string[],
    statuses: LicenceStatus[],
    user?: User,
  ): Promise<LicenceSummary[]> {
    return this.licenceApiClient.matchLicences({ statuses, nomisIds, user })
  }

  async getLatestLicenceByNomisIdsAndStatus(
    nomisIds: string[],
    statuses: LicenceStatus[],
    user?: User,
  ): Promise<LicenceSummary | null | undefined> {
    const licences = await this.licenceApiClient.matchLicences({ statuses, nomisIds, user })
    const licencesSortedDesc = licences.sort((a, b) => a.licenceId - b.licenceId)
    return _.last(licencesSortedDesc)
  }

  async getComReviewCount(user: User): Promise<ComReviewCount> {
    return this.licenceApiClient.getComReviewCount(user)
  }

  async updateComDetails(comDetails: UpdateComRequest): Promise<void> {
    return this.licenceApiClient.updateComDetails(comDetails)
  }

  async updatePrisonUserDetails(prisonUserDetails: UpdatePrisonUserRequest): Promise<void> {
    return this.licenceApiClient.updatePrisonUserDetails(prisonUserDetails)
  }

  async editApprovedLicence(licenceId: string, user: User): Promise<EditLicenceResponse> {
    return this.licenceApiClient.editLicence(licenceId, user)
  }

  async createVariation(licenceId: string, user: User): Promise<CreateVariationResponse> {
    return this.licenceApiClient.createVariation(licenceId, user)
  }

  async updateSpoDiscussion(licenceId: string, spoDiscussion: UpdateSpoDiscussionRequest, user: User): Promise<void> {
    return this.licenceApiClient.updateSpoDiscussion(licenceId, spoDiscussion, user)
  }

  async updateVloDiscussion(licenceId: string, vloDiscussion: UpdateVloDiscussionRequest, user: User): Promise<void> {
    return this.licenceApiClient.updateVloDiscussion(licenceId, vloDiscussion, user)
  }

  async updateReasonForVariation(
    licenceId: string,
    reasonForVariation: UpdateReasonForVariationRequest,
    user: User,
  ): Promise<void> {
    return this.licenceApiClient.updateReasonForVariation(licenceId, reasonForVariation, user)
  }

  async discard(licenceId: string, user: User): Promise<void> {
    return this.licenceApiClient.discard(licenceId, user)
  }

  async recordAuditEvent(
    summary: string,
    detail: string,
    // eslint-disable-next-line default-param-last
    licenceId: number = null,
    eventTime: Date,
    user: User = null,
  ): Promise<void> {
    const requestBody = {
      username: user.username,
      eventTime: format(eventTime, 'dd/MM/yyyy HH:mm:ss'),
      eventType: user ? 'USER_EVENT' : 'SYSTEM_EVENT',
      licenceId,
      fullName: `${user.firstName} ${user.lastName}`,
      summary,
      detail,
    } as AuditEvent

    return this.licenceApiClient.recordAuditEvent(requestBody, user)
  }

  async getAuditEvents(
    user: User,
    forLicenceId: number = null,
    forUsername: string = null,
    startTime: Date = null,
    endTime: Date = null,
  ): Promise<AuditEvent[]> {
    const requestBody = {
      username: forUsername || null,
      licenceId: forLicenceId || null,
      startTime: startTime ? format(startTime, 'dd/MM/yyyy HH:mm:ss') : null,
      endTime: endTime ? format(endTime, 'dd/MM/yyyy HH:mm:ss') : null,
    } as AuditRequest

    return this.licenceApiClient.getAuditEvents(requestBody, user)
  }

  async updatePrisonInformation(
    licenceId: string,
    prisonInformation: UpdatePrisonInformationRequest,
    user?: User,
  ): Promise<void> {
    return this.licenceApiClient.updatePrisonInformation(licenceId, prisonInformation, user)
  }

  async updateSentenceDates(licenceId: string, user?: User): Promise<void> {
    return this.licenceApiClient.updateSentenceDates(licenceId, user)
  }

  async approveVariation(licenceId: string, user: User): Promise<void> {
    return this.licenceApiClient.approveVariation(licenceId, user)
  }

  async referVariation(licenceId: string, referVariationRequest: ReferVariationRequest, user: User): Promise<void> {
    return this.licenceApiClient.referVariation(licenceId, referVariationRequest, user)
  }

  async compareVariationToOriginal(variation: Licence, user: User): Promise<VariedConditions> {
    if (isVariation(variation)) {
      const originalLicence = await this.getLicence(variation.variationOf, user)
      return compareLicenceConditions(originalLicence, variation)
    }
    return {} as VariedConditions
  }

  async getApprovalConversation(variation: Licence, user: User): Promise<ApprovalComment[]> {
    const conversationEventTypes = [
      LicenceEventType.VARIATION_SUBMITTED_REASON.valueOf(),
      LicenceEventType.VARIATION_REFERRED.valueOf(),
    ]

    const licenceEvents = await this.licenceApiClient.matchLicenceEvents(
      `${variation.id}`,
      conversationEventTypes,
      'eventTime',
      'DESC',
      user,
    )

    const conversation = licenceEvents?.map(event => {
      return {
        who: `${event.forenames} ${event.surname}`,
        when: event.eventTime,
        comment: event.eventDescription,
        role: event.eventType === LicenceEventType.VARIATION_SUBMITTED_REASON ? 'COM' : 'APPROVER',
      } as ApprovalComment
    })

    return conversation || []
  }

  async getOmuEmail(prisonId: string, user: User): Promise<OmuContact | null> {
    return this.licenceApiClient.getOmuEmail(prisonId, user)
  }

  async updateOmuEmailAddress(prisonId: string, user: User, omuEmail: Record<string, string>): Promise<OmuContact> {
    return this.licenceApiClient.updateOmuEmailAddress(prisonId, user, omuEmail)
  }

  async deleteOmuEmailAddress(prisonId: string, user: User): Promise<void> {
    return this.licenceApiClient.deleteOmuEmailAddress(prisonId, user)
  }

  async getIncompleteLicenceVariations(nomisId: string): Promise<LicenceSummary[]> {
    return this.getLicencesByNomisIdsAndStatus(
      [nomisId],
      [
        LicenceStatus.VARIATION_IN_PROGRESS,
        LicenceStatus.VARIATION_SUBMITTED,
        LicenceStatus.VARIATION_REJECTED,
        LicenceStatus.VARIATION_APPROVED,
      ],
    )
  }

  async updateOffenderDetails(nomisId: string, offenderDetails: UpdateOffenderDetailsRequest): Promise<void> {
    return this.licenceApiClient.updateOffenderDetails(nomisId, offenderDetails)
  }

  async deactivateLicences(licences: LicenceSummary[]): Promise<void> {
    const licenceIds = licences.map(l => l.licenceId)
    return this.licenceApiClient.batchInActivateLicences(licenceIds)
  }

  async getParentLicenceOrSelf(licenceId: number, user: User): Promise<Licence> {
    return this.licenceApiClient.getParentLicenceOrSelf(licenceId, user)
  }

  async reviewWithoutVariation(licenceId: number, user: User): Promise<void> {
    return this.licenceApiClient.reviewWithoutVariation(licenceId, user)
  }

  async getPrisonerDetail(nomsId: string, user: User): Promise<PrisonerWithCvlFields> {
    return this.licenceApiClient.getPrisonerDetail(nomsId, user)
  }

  async deactivateActiveAndVariationLicences(licenceId: number, reason: string): Promise<void> {
    return this.licenceApiClient.deactivateActiveAndVariationLicences(licenceId, reason)
  }

  async getIneligibilityReasons(nomsId: string): Promise<EligibilityAssessment> {
    return this.licenceApiClient.getIneligibilityReasons(nomsId)
  }

  async getIS91Status(nomsId: string): Promise<boolean> {
    return this.licenceApiClient.getIS91Status(nomsId)
  }

  async getLastMinuteCases(): Promise<LastMinuteHandoverCaseResponse[]> {
    return this.licenceApiClient.getLastMinuteCases()
  }

  async getUpcomingReleasesWithMonitoring(): Promise<UpcomingReleasesWithMonitoringConditionsResponse[]> {
    return this.licenceApiClient.getUpcomingReleasesWithMonitoring()
  }

  async updateElectronicMonitoringProgramme(
    licenceId: number,
    updateElectronicMonitoringProgrammeRequest: UpdateElectronicMonitoringProgrammeRequest,
  ): Promise<void> {
    return this.licenceApiClient.updateElectronicMonitoringProgramme(
      licenceId,
      updateElectronicMonitoringProgrammeRequest,
    )
  }

  async syncComAllocation(crn: string, user: User = null): Promise<void> {
    return this.licenceApiClient.syncComAllocation(crn, user)
  }

  async canComAccessLicence(licenceId: number, user: User): Promise<boolean> {
    const permissions = await this.licenceApiClient.getLicencePermissions(
      licenceId,
      { teamCodes: user.probationTeamCodes },
      user,
    )
    return permissions.view
  }

  async getOrCreateLicenceVariation(nomsId: string, licenceId: string, user: User): Promise<CreateLicenceResponse> {
    let newLicence: CreateLicenceResponse
    const licenceVariations = await this.getIncompleteLicenceVariations(nomsId)
    if (licenceVariations?.length > 0) {
      newLicence = _.head(licenceVariations)
    } else {
      newLicence = await this.createVariation(licenceId, user)
    }
    return newLicence
  }

  async getCaseAccessDetails(crn: string): Promise<CaseAccessDetails> {
    return this.licenceApiClient.getCaseAccessDetails(crn)
  }

  async checkComCaseAccess(request: CheckCaseAccessRequest, user: User): Promise<CaseAccessDetails> {
    return this.licenceApiClient.checkComCaseAccess(request, user)
  }
}
