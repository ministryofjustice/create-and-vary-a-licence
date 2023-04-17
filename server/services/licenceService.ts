import { Readable } from 'stream'
import fs from 'fs'
import _ from 'lodash'
import { format } from 'date-fns'
import moment from 'moment'
import {
  AdditionalCondition,
  AdditionalConditionsRequest,
  AppointmentAddressRequest,
  AppointmentPersonRequest,
  AppointmentTimeRequest,
  AuditEvent,
  AuditRequest,
  BespokeConditionsRequest,
  ContactNumberRequest,
  CreateLicenceRequest,
  EmailContact,
  Licence,
  LicenceSummary,
  NotifyRequest,
  ReferVariationRequest,
  StatusUpdateRequest,
  UpdateAdditionalConditionDataRequest,
  UpdateComRequest,
  UpdatePrisonInformationRequest,
  UpdateProbationTeamRequest,
  UpdateReasonForVariationRequest,
  UpdateSentenceDatesRequest,
  UpdateSpoDiscussionRequest,
  UpdateStandardConditionDataRequest,
  UpdateVloDiscussionRequest,
  OmuContact,
  AddAdditionalConditionRequest,
  LicenceConditionChange,
} from '../@types/licenceApiClientTypes'
import LicenceApiClient from '../data/licenceApiClient'
import {
  addressObjectToString,
  convertDateFormat,
  convertToTitleCase,
  filterCentralCaseload,
  objectIsEmpty,
  simpleDateTimeToJson,
} from '../utils/utils'
import PersonName from '../routes/creatingLicences/types/personName'
import SimpleDateTime from '../routes/creatingLicences/types/simpleDateTime'
import Telephone from '../routes/creatingLicences/types/telephone'
import Address from '../routes/creatingLicences/types/address'
import BespokeConditions from '../routes/creatingLicences/types/bespokeConditions'
import LicenceStatus from '../enumeration/licenceStatus'
import PrisonerService from './prisonerService'
import CommunityService from './communityService'
import AdditionalConditions from '../routes/creatingLicences/types/additionalConditions'
import Stringable from '../routes/creatingLicences/types/abstract/stringable'
import LicenceType from '../enumeration/licenceType'
import { User } from '../@types/CvlUserDetails'
import compareLicenceConditions, { VariedConditions } from '../utils/licenceComparator'
import ApprovalComment from '../@types/ApprovalComment'
import LicenceEventType from '../enumeration/licenceEventType'
import TimelineEvent from '../@types/TimelineEvent'
import TimelineEventType from '../enumeration/TimelineEventType'
import ConditionService from './conditionService'
import { Prisoner } from '../@types/prisonerSearchApiClientTypes'

export default class LicenceService {
  constructor(
    private readonly licenceApiClient: LicenceApiClient,
    private readonly prisonerService: PrisonerService,
    private readonly communityService: CommunityService,
    private readonly conditionService: ConditionService
  ) {}

  async createLicence(prisonerNumber: string, user: User): Promise<LicenceSummary> {
    const nomisRecord = _.head(await this.prisonerService.searchPrisonersByNomisIds([prisonerNumber], user))
    const deliusRecord = await this.communityService.getProbationer({ nomsNumber: prisonerNumber })

    const [prisonInformation, offenderManagers] = await Promise.all([
      this.prisonerService.getPrisonInformation(nomisRecord.prisonId, user),
      this.communityService.getAnOffendersManagers(deliusRecord.otherIds?.crn),
    ])

    const responsibleOfficer = deliusRecord.offenderManagers.find(om => om.active)
    const responsibleOfficerDetails = offenderManagers.find(om => om.staffCode === responsibleOfficer.staff.code)

    const licenceType = LicenceService.getLicenceType(nomisRecord)

    const licence = {
      typeCode: licenceType,
      version: await this.conditionService.getPolicyVersion(),
      nomsId: prisonerNumber,
      bookingNo: nomisRecord.bookNumber,
      bookingId: parseInt(nomisRecord.bookingId, 10),
      prisonCode: nomisRecord.prisonId,
      forename: convertToTitleCase(nomisRecord.firstName),
      middleNames: convertToTitleCase(nomisRecord.middleNames),
      surname: convertToTitleCase(nomisRecord.lastName),
      dateOfBirth: convertDateFormat(nomisRecord.dateOfBirth),
      conditionalReleaseDate:
        convertDateFormat(nomisRecord.conditionalReleaseOverrideDate) ||
        convertDateFormat(nomisRecord.conditionalReleaseDate),
      actualReleaseDate: convertDateFormat(nomisRecord.confirmedReleaseDate),
      sentenceStartDate: convertDateFormat(nomisRecord.sentenceStartDate),
      sentenceEndDate: convertDateFormat(nomisRecord.sentenceExpiryDate),
      licenceStartDate:
        convertDateFormat(nomisRecord.confirmedReleaseDate) || convertDateFormat(nomisRecord.conditionalReleaseDate),
      licenceExpiryDate: convertDateFormat(nomisRecord.licenceExpiryDate),
      topupSupervisionStartDate: convertDateFormat(nomisRecord.topupSupervisionStartDate),
      topupSupervisionExpiryDate: convertDateFormat(nomisRecord.topupSupervisionExpiryDate),
      prisonDescription: prisonInformation.formattedDescription || 'Not known',
      prisonTelephone: [
        prisonInformation.phones.find(phone => phone.type === 'BUS')?.ext,
        prisonInformation.phones.find(phone => phone.type === 'BUS')?.number,
      ]
        .filter(n => n)
        .join(' '),
      probationAreaCode: responsibleOfficerDetails.probationArea?.code,
      probationAreaDescription: responsibleOfficerDetails.probationArea?.description,
      probationPduCode: responsibleOfficerDetails.team?.borough?.code,
      probationPduDescription: responsibleOfficerDetails.team?.borough?.description,
      probationLauCode: responsibleOfficerDetails.team?.district?.code,
      probationLauDescription: responsibleOfficerDetails.team?.district?.description,
      probationTeamCode: responsibleOfficerDetails.team?.code,
      probationTeamDescription: responsibleOfficerDetails.team?.description,
      crn: deliusRecord.otherIds?.crn,
      pnc: deliusRecord.otherIds?.pncNumber,
      cro: deliusRecord.otherIds?.croNumber,
      standardLicenceConditions: [LicenceType.AP, LicenceType.AP_PSS].includes(licenceType)
        ? await this.conditionService.getStandardConditions(LicenceType.AP)
        : [],
      standardPssConditions: [LicenceType.PSS, LicenceType.AP_PSS].includes(licenceType)
        ? await this.conditionService.getStandardConditions(LicenceType.PSS)
        : [],
      responsibleComStaffId: responsibleOfficerDetails.staffId,
    } as CreateLicenceRequest

    // TODO: This section can be removed after having been live in production for some time. This is only needed initially because some
    //  COM records will not be saved in our database initially. Over time, the OFFENDER_MANAGER_CHANGED event, and logins will have populated
    //  staff details into the database, and this call will have become redundant
    const comDetails = await this.communityService.getStaffDetailByStaffIdentifier(responsibleOfficerDetails.staffId)
    await this.updateComDetails({
      staffIdentifier: comDetails?.staffIdentifier,
      staffUsername: comDetails?.username,
      staffEmail: comDetails?.email,
      firstName: comDetails?.staff?.forenames,
      lastName: comDetails?.staff?.surname,
    })

    return this.licenceApiClient.createLicence(licence, user)
  }

  async getLicence(id: string, user: User): Promise<Licence> {
    return this.licenceApiClient.getLicenceById(id, user)
  }

  async getPolicyChanges(id: string): Promise<LicenceConditionChange[]> {
    const activePolicyVersion = await this.conditionService.getPolicyVersion()

    return this.licenceApiClient.getPolicyChanges(id, activePolicyVersion) as Promise<LicenceConditionChange[]>
  }

  async updateAppointmentPerson(id: string, formData: PersonName, user: User): Promise<void> {
    const requestBody = {
      appointmentPerson: formData.contactName,
    } as AppointmentPersonRequest

    return this.licenceApiClient.updateAppointmentPerson(id, requestBody, user)
  }

  async updateAppointmentTime(id: string, formData: SimpleDateTime, user: User): Promise<void> {
    const appointmentTime = simpleDateTimeToJson(formData)
    const requestBody = { appointmentTime } as AppointmentTimeRequest
    return this.licenceApiClient.updateAppointmentTime(id, requestBody, user)
  }

  async updateAppointmentAddress(id: string, formData: Address, user: User): Promise<void> {
    const appointmentAddress = addressObjectToString(formData)
    const requestBody = { appointmentAddress } as AppointmentAddressRequest
    return this.licenceApiClient.updateAppointmentAddress(id, requestBody, user)
  }

  async updateContactNumber(id: string, formData: Telephone, user: User): Promise<void> {
    const requestBody = { telephone: formData.telephone } as ContactNumberRequest
    return this.licenceApiClient.updateContactNumber(id, requestBody, user)
  }

  async addAdditionalCondition(
    id: string,
    conditionType: LicenceType,
    formData: AddAdditionalConditionRequest,
    user: User
  ) {
    return this.licenceApiClient.addAdditionalCondition(id, conditionType, formData, user)
  }

  async deleteAdditionalCondition(conditionId: number, licenceId: number, user: User) {
    return this.licenceApiClient.deleteAdditionalCondition(conditionId, licenceId, user)
  }

  async deleteAdditionalConditionsByCode(conditionCode: string, licence: Licence, user: User): Promise<void> {
    const conditionIds = licence.additionalLicenceConditions.filter(c => c.code === conditionCode).map(c => c.id)
    await Promise.all(
      conditionIds.map(conditionId => this.licenceApiClient.deleteAdditionalCondition(conditionId, licence.id, user))
    )
  }

  async updateAdditionalConditions(
    id: string,
    conditionType: LicenceType,
    formData: AdditionalConditions,
    user: User,
    licenceVersion: string
  ): Promise<void> {
    const additionalConditions =
      formData.additionalConditions?.map(async (conditionCode, index) => {
        const additionalConditionConfig = await this.conditionService.getAdditionalConditionByCode(
          conditionCode,
          licenceVersion
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
    formData: unknown,
    user: User
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

    const licence = await this.getLicence(licenceId, user)
    const requestBody = {
      expandedConditionText: await this.conditionService.expandAdditionalCondition(
        condition.code,
        enteredData,
        licence.version
      ),
      data: enteredData,
    } as UpdateAdditionalConditionDataRequest

    return this.licenceApiClient.updateAdditionalConditionData(licenceId, condition.id.toString(), requestBody, user)
  }

  async uploadExclusionZoneFile(
    licenceId: string,
    additionalConditionId: string,
    fileToUpload: Express.Multer.File,
    user: User,
    testMode = false
  ): Promise<void> {
    await this.licenceApiClient.uploadExclusionZoneFile(licenceId, additionalConditionId, user, fileToUpload)
    if (!testMode) {
      fs.unlinkSync(fileToUpload.path)
    }
  }

  async removeExclusionZoneFile(licenceId: string, conditionId: string, user: User): Promise<void> {
    return this.licenceApiClient.removeExclusionZoneFile(licenceId, conditionId, user)
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

  async updateStatus(id: string, newStatus: LicenceStatus, user?: User): Promise<void> {
    const requestBody = {
      status: newStatus,
      username: user?.username || 'SYSTEM',
      fullName: user?.displayName || 'SYSTEM',
    } as StatusUpdateRequest
    return this.licenceApiClient.updateLicenceStatus(id, requestBody, user)
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
    user?: User
  ): Promise<LicenceSummary[]> {
    return this.licenceApiClient.matchLicences(statuses, null, null, nomisIds, null, null, null, user)
  }

  async getLatestLicenceByNomisIdsAndStatus(
    nomisIds: string[],
    statuses: LicenceStatus[],
    user?: User
  ): Promise<LicenceSummary | null | undefined> {
    const licences = await this.licenceApiClient.matchLicences(statuses, null, null, nomisIds, null, null, null, user)
    return _.head(licences)
  }

  async getLicencesForApproval(user: User, prisonCaseload: string[]): Promise<LicenceSummary[]> {
    const statuses = [LicenceStatus.SUBMITTED.valueOf()]
    const filteredPrisons = filterCentralCaseload(prisonCaseload)
    return this.licenceApiClient.matchLicences(
      statuses,
      filteredPrisons,
      null,
      null,
      null,
      'conditionalReleaseDate',
      null,
      user
    )
  }

  async getLicencesForOmu(user: User, prisonCaseload: string[]): Promise<LicenceSummary[]> {
    const statuses = [
      LicenceStatus.ACTIVE.valueOf(),
      LicenceStatus.APPROVED.valueOf(),
      LicenceStatus.SUBMITTED.valueOf(),
      LicenceStatus.IN_PROGRESS.valueOf(),
      LicenceStatus.VARIATION_APPROVED.valueOf(),
      LicenceStatus.VARIATION_IN_PROGRESS.valueOf(),
      LicenceStatus.VARIATION_SUBMITTED.valueOf(),
    ]
    const filteredPrisons = filterCentralCaseload(prisonCaseload)
    return this.licenceApiClient.matchLicences(
      statuses,
      filteredPrisons,
      null,
      null,
      null,
      'conditionalReleaseDate',
      null,
      user
    )
  }

  async getLicencesForVariationApproval(user: User): Promise<LicenceSummary[]> {
    const statuses = [LicenceStatus.VARIATION_SUBMITTED.valueOf()]
    return this.licenceApiClient.matchLicences(
      statuses,
      null,
      null,
      null,
      user?.probationPduCodes,
      'conditionalReleaseDate',
      null,
      user
    )
  }

  async getLicencesForVariationApprovalByRegion(user: User): Promise<LicenceSummary[]> {
    return this.licenceApiClient.submittedVariationsByProbationArea(user?.probationAreaCode, user)
  }

  async updateResponsibleCom(crn: string, newCom: UpdateComRequest): Promise<void> {
    return this.licenceApiClient.updateResponsibleCom(crn, newCom)
  }

  async updateProbationTeam(crn: string, newProbationTeam: UpdateProbationTeamRequest): Promise<void> {
    return this.licenceApiClient.updateProbationTeam(crn, newProbationTeam)
  }

  async updateComDetails(comDetails: UpdateComRequest): Promise<void> {
    return this.licenceApiClient.updateComDetails(comDetails)
  }

  async createVariation(licenceId: string, user: User): Promise<LicenceSummary> {
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
    user: User
  ): Promise<void> {
    return this.licenceApiClient.updateReasonForVariation(licenceId, reasonForVariation, user)
  }

  async discard(licenceId: string, user: User): Promise<void> {
    return this.licenceApiClient.discard(licenceId, user)
  }

  async recordAuditEvent(
    summary: string,
    detail: string,
    licenceId: number = null,
    eventTime: Date,
    user: User = null
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
    forLicenceId: number = null,
    forUsername: string = null,
    startTime: Date,
    endTime: Date,
    user: User
  ): Promise<AuditEvent[]> {
    const requestBody = {
      username: forUsername || null,
      licenceId: forLicenceId || null,
      startTime: format(startTime, 'dd/MM/yyyy HH:mm:ss'),
      endTime: format(endTime, 'dd/MM/yyyy HH:mm:ss'),
    } as AuditRequest

    return this.licenceApiClient.getAuditEvents(requestBody, user)
  }

  async updatePrisonInformation(
    licenceId: string,
    prisonInformation: UpdatePrisonInformationRequest,
    user?: User
  ): Promise<void> {
    return this.licenceApiClient.updatePrisonInformation(licenceId, prisonInformation, user)
  }

  async updateSentenceDates(licenceId: string, sentenceDates: UpdateSentenceDatesRequest, user?: User): Promise<void> {
    return this.licenceApiClient.updateSentenceDates(licenceId, sentenceDates, user)
  }

  async approveVariation(licenceId: string, user: User): Promise<void> {
    return this.licenceApiClient.approveVariation(licenceId, user)
  }

  async referVariation(licenceId: string, referVariationRequest: ReferVariationRequest, user: User): Promise<void> {
    return this.licenceApiClient.referVariation(licenceId, referVariationRequest, user)
  }

  async compareVariationToOriginal(variation: Licence, user: User): Promise<VariedConditions> {
    if (variation?.variationOf) {
      const originalLicence = await this.getLicence(variation.variationOf.toString(), user)
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
      user
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

  async notifyComsToPromptLicenceCreation(emailGroups: EmailContact[]): Promise<void> {
    return this.licenceApiClient.notifyComsToPromptEmailCreation(emailGroups)
  }

  async getTimelineEvents(licence: Licence, user: User): Promise<TimelineEvent[]> {
    const licences: Licence[] = []
    let thisLicence: Licence = licence
    licences.push(thisLicence)

    // Get the trail of variations back to the original licence
    while (thisLicence?.isVariation) {
      // eslint-disable-next-line no-await-in-loop
      thisLicence = await this.licenceApiClient.getLicenceById(`${thisLicence?.variationOf}`, user)
      if (thisLicence) {
        licences.push(thisLicence)
      }
    }

    return this.convertLicencesToTimelineEvents(licences)
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

  async getParentLicenceOrSelf(licenceId: string, user: User): Promise<Licence> {
    const licence = await this.licenceApiClient.getLicenceById(licenceId, user)
    if (!licence.variationOf) {
      return licence
    }

    return this.licenceApiClient.getLicenceById(licence.variationOf.toString(), user)
  }

  public static getLicenceType = (sentenceDetail: Prisoner): LicenceType => {
    const tused = sentenceDetail?.topupSupervisionExpiryDate
    const led = sentenceDetail?.licenceExpiryDate

    if (!led) {
      return LicenceType.PSS
    }

    if (!tused || moment(tused, 'YYYY-MM-DD') <= moment(led, 'YYYY-MM-DD')) {
      return LicenceType.AP
    }

    return LicenceType.AP_PSS
  }

  private convertLicencesToTimelineEvents(licences: Licence[]): TimelineEvent[] {
    return licences.map(licence => {
      const { title, eventType } = LicenceService.getTimelineEventType(licence.variationOf, licence.statusCode)
      return new TimelineEvent(
        eventType,
        title,
        licence.statusCode,
        licence.createdByFullName,
        licence.id,
        licence.dateLastUpdated
      )
    })
  }

  private static getTimelineEventType(varyOf: number, status: string): { eventType: TimelineEventType; title: string } {
    switch (status) {
      case LicenceStatus.VARIATION_IN_PROGRESS:
        return { eventType: TimelineEventType.VARIATION_IN_PROGRESS, title: 'Variation in progress' }

      case LicenceStatus.VARIATION_SUBMITTED:
        return { eventType: TimelineEventType.SUBMITTED, title: 'Variation submitted' }

      case LicenceStatus.VARIATION_REJECTED:
        return { eventType: TimelineEventType.REJECTED, title: 'Variation rejected' }

      case LicenceStatus.VARIATION_APPROVED:
        return { eventType: TimelineEventType.VARIATION, title: 'Licence varied' }

      case LicenceStatus.ACTIVE:
      case LicenceStatus.INACTIVE:
      default:
        return varyOf
          ? { eventType: TimelineEventType.VARIATION, title: 'Licence varied' }
          : { eventType: TimelineEventType.CREATION, title: 'Licence created' }
    }
  }
}
