import { Readable } from 'stream'
import fs from 'fs'
import moment from 'moment'
import {
  AdditionalConditionsRequest,
  AppointmentAddressRequest,
  AppointmentPersonRequest,
  AppointmentTimeRequest,
  AuditEvent,
  AuditRequest,
  BespokeConditionsRequest,
  ContactNumberRequest,
  CreateLicenceRequest,
  Licence,
  LicenceSummary,
  StatusUpdateRequest,
  UpdateAdditionalConditionDataRequest,
  UpdateComRequest,
} from '../@types/licenceApiClientTypes'
import LicenceApiClient from '../data/licenceApiClient'
import { getAdditionalConditionByCode, getStandardConditions, getVersion } from '../utils/conditionsProvider'
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
import { PrisonApiPrisoner } from '../@types/prisonApiClientTypes'
import { User } from '../@types/CvlUserDetails'

export default class LicenceService {
  constructor(
    private readonly licenceApiClient: LicenceApiClient,
    private readonly prisonerService: PrisonerService,
    private readonly communityService: CommunityService
  ) {}

  async createLicence(prisonerNumber: string, user: User): Promise<LicenceSummary> {
    const [nomisRecord, deliusRecord] = await Promise.all([
      this.prisonerService.getPrisonerDetail(prisonerNumber, user),
      this.communityService.getProbationer({ nomsNumber: prisonerNumber }),
    ])
    const [prisonInformation, offenderManagers] = await Promise.all([
      this.prisonerService.getPrisonInformation(nomisRecord.agencyId, user),
      this.communityService.getAnOffendersManagers(deliusRecord.otherIds?.crn),
    ])

    const responsibleOfficer = offenderManagers.find(om => om.isResponsibleOfficer)

    const licenceType = this.getLicenceType(nomisRecord)

    const licence = {
      typeCode: licenceType,
      version: getVersion(),
      nomsId: prisonerNumber,
      bookingNo: nomisRecord.bookingNo,
      bookingId: nomisRecord.bookingId,
      prisonCode: nomisRecord.agencyId,
      forename: convertToTitleCase(nomisRecord.firstName),
      middleNames: convertToTitleCase(nomisRecord.middleName),
      surname: convertToTitleCase(nomisRecord.lastName),
      dateOfBirth: convertDateFormat(nomisRecord.dateOfBirth),
      conditionalReleaseDate:
        convertDateFormat(nomisRecord.sentenceDetail?.conditionalReleaseOverrideDate) ||
        convertDateFormat(nomisRecord.sentenceDetail?.conditionalReleaseDate),
      actualReleaseDate: convertDateFormat(nomisRecord.sentenceDetail?.releaseDate),
      sentenceStartDate: convertDateFormat(nomisRecord.sentenceDetail?.sentenceStartDate),
      sentenceEndDate: convertDateFormat(nomisRecord.sentenceDetail?.effectiveSentenceEndDate),
      licenceStartDate:
        convertDateFormat(nomisRecord.sentenceDetail?.releaseDate) ||
        convertDateFormat(nomisRecord.sentenceDetail?.conditionalReleaseOverrideDate) ||
        convertDateFormat(nomisRecord.sentenceDetail?.conditionalReleaseDate),
      licenceExpiryDate: convertDateFormat(nomisRecord.sentenceDetail?.licenceExpiryDate),
      topupSupervisionStartDate: convertDateFormat(nomisRecord.sentenceDetail?.topupSupervisionStartDate),
      topupSupervisionExpiryDate: convertDateFormat(nomisRecord.sentenceDetail?.topupSupervisionExpiryDate),
      prisonDescription: prisonInformation.formattedDescription || 'Not known',
      prisonTelephone: [
        prisonInformation.phones.find(phone => phone.type === 'BUS')?.ext,
        prisonInformation.phones.find(phone => phone.type === 'BUS')?.number,
      ]
        .filter(n => n)
        .join(' '),
      probationAreaCode: responsibleOfficer.probationArea?.code,
      probationAreaDescription: responsibleOfficer.probationArea?.description,
      probationPduCode: responsibleOfficer.team?.borough?.code,
      probationPduDescription: responsibleOfficer.team?.borough?.description,
      probationLauCode: responsibleOfficer.team?.district?.code,
      probationLauDescription: responsibleOfficer.team?.district?.description,
      probationTeamCode: responsibleOfficer.team?.code,
      probationTeamDescription: responsibleOfficer.team?.description,
      crn: deliusRecord.otherIds?.crn,
      pnc: deliusRecord.otherIds?.pncNumber,
      cro: deliusRecord.otherIds?.croNumber,
      standardLicenceConditions: [LicenceType.AP, LicenceType.AP_PSS].includes(licenceType)
        ? getStandardConditions(LicenceType.AP)
        : [],
      standardPssConditions: [LicenceType.PSS, LicenceType.AP_PSS].includes(licenceType)
        ? getStandardConditions(LicenceType.PSS)
        : [],
      responsibleComStaffId: responsibleOfficer.staffId,
    } as CreateLicenceRequest

    // TODO: This section can be removed after having been live in production for some time. This is only needed initially because some
    //  COM records will not be saved in our database initially. Over time, the OFFENDER_MANAGER_CHANGED event, and logins will have populated
    //  staff details into the database, and this call will have become redundant
    const comDetails = await this.communityService.getStaffDetailByStaffIdentifier(responsibleOfficer.staffId)
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

  async updateAdditionalConditions(
    id: string,
    conditionType: LicenceType,
    formData: AdditionalConditions,
    user: User
  ): Promise<void> {
    const requestBody = {
      additionalConditions:
        formData.additionalConditions?.map((conditionCode, index) => {
          const additionalConditionConfig = getAdditionalConditionByCode(conditionCode)
          return {
            code: conditionCode,
            sequence: index,
            category: additionalConditionConfig?.categoryShort || additionalConditionConfig?.category,
            text: additionalConditionConfig?.text,
          }
        }) || [],
      conditionType,
    } as AdditionalConditionsRequest

    return this.licenceApiClient.updateAdditionalConditions(id, requestBody, user)
  }

  async updateAdditionalConditionData(
    licenceId: string,
    additionalConditionId: string,
    formData: unknown,
    user: User
  ): Promise<void> {
    let sequenceNumber = -1

    const requestBody = {
      data: Object.keys(formData)
        .filter(key => formData[key] && !objectIsEmpty(formData[key]))
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
        }),
    } as UpdateAdditionalConditionDataRequest

    return this.licenceApiClient.updateAdditionalConditionData(licenceId, additionalConditionId, requestBody, user)
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

  async updateStatus(id: string, newStatus: LicenceStatus, user?: User): Promise<void> {
    const requestBody = {
      status: newStatus,
      username: user?.username || 'SYSTEM',
      fullName: user?.displayName || 'SYSTEM',
    } as StatusUpdateRequest
    return this.licenceApiClient.updateLicenceStatus(id, requestBody, user)
  }

  async submitLicence(id: string, user: User): Promise<void> {
    return this.licenceApiClient.submitLicence(id, user)
  }

  async getLicencesByNomisIdsAndStatus(
    nomisIds: string[],
    statuses: LicenceStatus[],
    user?: User
  ): Promise<LicenceSummary[]> {
    return this.licenceApiClient.matchLicences(statuses, [], [], nomisIds, null, null, user)
  }

  async getLicencesForApproval(user: User): Promise<LicenceSummary[]> {
    const statuses = [LicenceStatus.SUBMITTED.valueOf()]
    const filteredPrisons = filterCentralCaseload(user.prisonCaseload)
    return this.licenceApiClient.matchLicences(statuses, filteredPrisons, [], [], 'conditionalReleaseDate', null, user)
  }

  async getLicencesForOmu(user: User): Promise<LicenceSummary[]> {
    const statuses = [
      LicenceStatus.ACTIVE.valueOf(),
      LicenceStatus.APPROVED.valueOf(),
      LicenceStatus.REJECTED.valueOf(),
      LicenceStatus.SUBMITTED.valueOf(),
    ]
    const filteredPrisons = filterCentralCaseload(user.prisonCaseload)
    return this.licenceApiClient.matchLicences(statuses, filteredPrisons, [], [], 'conditionalReleaseDate', null, user)
  }

  async updateResponsibleCom(crn: string, newCom: UpdateComRequest): Promise<void> {
    return this.licenceApiClient.updateResponsibleCom(crn, newCom)
  }

  async updateComDetails(comDetails: UpdateComRequest): Promise<void> {
    return this.licenceApiClient.updateComDetails(comDetails)
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
      eventTime: moment(eventTime).format('DD/MM/YYYY hh:mm:ss'),
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
      startTime: moment(startTime).format('DD/MM/YYYY hh:mm:ss'),
      endTime: moment(endTime).format('DD/MM/YYYY hh:mm:ss'),
    } as AuditRequest

    return this.licenceApiClient.getAuditEvents(requestBody, user)
  }

  private getLicenceType = (nomisRecord: PrisonApiPrisoner): LicenceType => {
    const tused = nomisRecord.sentenceDetail?.topupSupervisionExpiryDate
    const led = nomisRecord.sentenceDetail?.licenceExpiryDate
    const sed = nomisRecord.sentenceDetail?.sentenceExpiryDate

    if (!tused) {
      return LicenceType.AP
    }

    if (!led && !sed) {
      return LicenceType.PSS
    }

    return LicenceType.AP_PSS
  }

  /**
   * Build the list for the staff caseload view.
   * Return the caseload for this staff member, merged with the licences which exist for these people.
   * Only concerned with licences that have a statusCode in (IN_PROGRESS, SUBMITTED, REJECTED, ACTIVE, RECALLED) - ignore INACTIVE.
   * When implemented for real this will use:
   *   - communityService - get the caseload summary list (surname, crn, nomsNumber, currentRo, currentOm)
   *   - prisonerService - use prisoner-offender-search to pull prisoner details matching the nomsNumber
   *   - licenceService - pull back licences matching these people, assembled into a licence[]
   */
  getCaseload(username: string, staffId: number): Record<string, unknown> {
    const content = [
      {
        nomsId: 'A1234AC',
        crn: 'X10786',
        prisonCode: 'LEI',
        prisonDescription: 'Leeds HMP',
        conditionalReleaseDate: '23/02/2022',
        surname: 'Mustafa',
        forename: 'Yasin',
        dateOfBirth: '20/12/1978',
        releaseDate: '20/12/2021',
        staffId,
        licences: [
          {
            id: 1,
            typeCode: 'AP',
            statusCode: 'IN_PROGRESS',
          },
        ],
      },
      {
        nomsId: 'A1234AB',
        crn: 'X10843',
        prisonCode: 'MDI',
        prisonDescription: 'Moorland HMP',
        conditionalReleaseDate: '12/09/2021',
        surname: 'McVeigh',
        forename: 'Stephen',
        dateOfBirth: '01/10/1994',
        releaseDate: '19/09/2021',
        staffId,
        licences: [
          {
            id: 2,
            typeCode: 'AP',
            statusCode: 'REJECTED',
          },
        ],
      },
      {
        nomsId: 'A1234AA',
        crn: 'X10745',
        prisonCode: 'LVI',
        prisonDescription: 'Liverpool HMP',
        conditionalReleaseDate: '19/01/2022',
        surname: 'Harrison',
        forename: 'Tim',
        dateOfBirth: '11/02/1971',
        releaseDate: '18/08/2021',
        staffId,
        licences: [
          {
            id: 3,
            typeCode: 'AP',
            statusCode: 'ACTIVE',
          },
          {
            id: 4,
            typeCode: 'AP',
            statusCode: 'IN_PROGRESS',
          },
        ],
      },
      {
        nomsId: 'A1234AD',
        crn: 'X10743',
        prisonCode: null,
        prisonDescription: null,
        conditionalReleaseDate: '19/01/2022',
        surname: 'Stobart',
        forename: 'Joel',
        dateOfBirth: '12/03/1978',
        releaseDate: '18/09/2021',
        staffId,
        licences: [],
      },
      {
        nomsId: 'A1234AE',
        crn: 'X10677',
        prisonCode: 'DVI',
        prisonDescription: 'Doncaster HMP',
        conditionalReleaseDate: '19/02/2022',
        surname: 'Elango',
        forename: 'Arul',
        dateOfBirth: '23/05/1975',
        releaseDate: '16/07/2021',
        staffId,
        licences: [
          {
            id: 5,
            typeCode: 'AP',
            statusCode: 'ACTIVE',
          },
        ],
      },
    ]

    return {
      content,
      results: {
        from: 1,
        to: 5,
        count: 5,
      },
      previous: {
        text: 'Previous',
        ref: '#',
      },
      next: {
        text: 'Next',
        href: '#',
      },
      items: [
        {
          text: '1',
          href: '#',
          selected: true,
        },
      ],
    }
  }
}
