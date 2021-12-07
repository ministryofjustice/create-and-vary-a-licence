import {
  AdditionalConditionsRequest,
  AppointmentAddressRequest,
  AppointmentPersonRequest,
  AppointmentTimeRequest,
  BespokeConditionsRequest,
  ContactNumberRequest,
  CreateLicenceRequest,
  Licence,
  LicenceSummary,
  StatusUpdateRequest,
  UpdateAdditionalConditionDataRequest,
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

export default class LicenceService {
  constructor(
    private readonly licenceApiClient: LicenceApiClient,
    private readonly prisonerService: PrisonerService,
    private readonly communityService: CommunityService
  ) {}

  async createLicence(prisonerNumber: string, username: string): Promise<LicenceSummary> {
    const nomisRecord = await this.prisonerService.getPrisonerDetail(username, prisonerNumber)
    const [staffDetail, deliusRecord, prisonInformation] = await Promise.all([
      this.communityService.getStaffDetail(username),
      this.communityService.getProbationer(prisonerNumber),
      this.prisonerService.getPrisonInformation(username, nomisRecord.agencyId),
    ])

    const offenderManager = deliusRecord.offenderManagers.find(om => om.active)

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
      ].join(' '),
      comUsername: staffDetail.username,
      comStaffId: staffDetail.staffIdentifier,
      comEmail: staffDetail.email,
      comFirstName: offenderManager?.staff?.forenames,
      comLastName: offenderManager?.staff?.surname,
      probationAreaCode: offenderManager?.probationArea?.code,
      probationLduCode: offenderManager?.team?.localDeliveryUnit?.code,
      crn: deliusRecord.otherIds?.crn,
      pnc: deliusRecord.otherIds?.pncNumber,
      cro: deliusRecord.otherIds?.croNumber,
      standardLicenceConditions: [LicenceType.AP, LicenceType.AP_PSS].includes(licenceType)
        ? getStandardConditions(LicenceType.AP)
        : [],
      standardPssConditions: [LicenceType.PSS, LicenceType.AP_PSS].includes(licenceType)
        ? getStandardConditions(LicenceType.PSS)
        : [],
    } as CreateLicenceRequest

    return this.licenceApiClient.createLicence(licence, username)
  }

  async getLicence(id: string, username: string): Promise<Licence> {
    return this.licenceApiClient.getLicenceById(id, username)
  }

  async updateAppointmentPerson(id: string, formData: PersonName, username: string): Promise<void> {
    const requestBody = {
      appointmentPerson: formData.contactName,
    } as AppointmentPersonRequest

    return this.licenceApiClient.updateAppointmentPerson(id, requestBody, username)
  }

  async updateAppointmentTime(id: string, formData: SimpleDateTime, username: string): Promise<void> {
    const appointmentTime = simpleDateTimeToJson(formData)
    const requestBody = { appointmentTime } as AppointmentTimeRequest
    return this.licenceApiClient.updateAppointmentTime(id, requestBody, username)
  }

  async updateAppointmentAddress(id: string, formData: Address, username: string): Promise<void> {
    const appointmentAddress = addressObjectToString(formData)
    const requestBody = { appointmentAddress } as AppointmentAddressRequest
    return this.licenceApiClient.updateAppointmentAddress(id, requestBody, username)
  }

  async updateContactNumber(id: string, formData: Telephone, username: string): Promise<void> {
    const requestBody = { comTelephone: formData.telephone } as ContactNumberRequest
    return this.licenceApiClient.updateContactNumber(id, requestBody, username)
  }

  async updateAdditionalConditions(
    id: string,
    conditionType: LicenceType,
    formData: AdditionalConditions,
    username: string
  ): Promise<void> {
    const requestBody = {
      additionalConditions:
        formData.additionalConditions?.map((conditionCode, index) => {
          return {
            code: conditionCode,
            sequence: index,
            category:
              getAdditionalConditionByCode(conditionCode)?.categoryShort ||
              getAdditionalConditionByCode(conditionCode)?.category,
            text: getAdditionalConditionByCode(conditionCode)?.text,
          }
        }) || [],
      conditionType,
    } as AdditionalConditionsRequest

    return this.licenceApiClient.updateAdditionalConditions(id, requestBody, username)
  }

  async updateAdditionalConditionData(
    licenceId: string,
    additionalConditionId: string,
    formData: unknown,
    username: string
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

    return this.licenceApiClient.updateAdditionalConditionData(licenceId, additionalConditionId, requestBody, username)
  }

  async updateBespokeConditions(id: string, formData: BespokeConditions, username: string): Promise<void> {
    const sanitised = formData.conditions.filter((c: string) => c !== null && c.length > 0)
    const requestBody = { conditions: sanitised } as BespokeConditionsRequest
    return this.licenceApiClient.updateBespokeConditions(id, requestBody, username)
  }

  async updateStatus(id: string, newStatus: LicenceStatus, username: string, fullName: string = null): Promise<void> {
    const requestBody = { status: newStatus, username, fullName } as StatusUpdateRequest
    return this.licenceApiClient.updateLicenceStatus(id, requestBody, username)
  }

  async getLicencesByStaffIdAndStatus(
    staffId: number,
    statuses: LicenceStatus[],
    username: string
  ): Promise<LicenceSummary[]> {
    return this.licenceApiClient.getLicencesByStaffIdAndStatus(staffId, statuses, username)
  }

  async getLicencesForApproval(username: string, prisons: string[]): Promise<LicenceSummary[]> {
    const statuses = [LicenceStatus.SUBMITTED.valueOf()]
    const filteredPrisons = filterCentralCaseload(prisons)
    return this.licenceApiClient.matchLicences(
      statuses,
      filteredPrisons,
      [],
      [],
      'conditionalReleaseDate',
      null,
      username
    )
  }

  async getLicencesForCaseAdmin(
    username: string,
    authSource: string,
    prisons: string[] = [],
    staffId: number = null
  ): Promise<LicenceSummary[]> {
    const statuses = [
      LicenceStatus.ACTIVE.valueOf(),
      LicenceStatus.APPROVED.valueOf(),
      LicenceStatus.REJECTED.valueOf(),
      LicenceStatus.SUBMITTED.valueOf(),
    ]
    if (authSource === 'nomis') {
      const filteredPrisons = filterCentralCaseload(prisons)
      return this.licenceApiClient.matchLicences(
        statuses,
        filteredPrisons,
        [],
        [],
        'conditionalReleaseDate',
        null,
        username
      )
    }
    if (authSource === 'delius') {
      return this.licenceApiClient.matchLicences(statuses, [], [staffId], [], 'conditionalReleaseDate', null, username)
    }
    return []
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
