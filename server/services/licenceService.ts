import type HmppsAuthClient from '../data/hmppsAuthClient'
import {
  AdditionalConditionsRequest,
  AppointmentAddressRequest,
  AppointmentPersonRequest,
  AppointmentTimeRequest,
  BespokeConditionsRequest,
  ContactNumberRequest,
  CreateLicenceRequest,
  Licence,
  LicenceApiTestData,
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

export default class LicenceService {
  constructor(
    private readonly hmppsAuthClient: HmppsAuthClient,
    private readonly prisonerService: PrisonerService,
    private readonly communityService: CommunityService
  ) {}

  async getTestData(username: string): Promise<LicenceApiTestData[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    return new LicenceApiClient(token).getTestData()
  }

  async createLicence(prisonerNumber: string, username: string): Promise<LicenceSummary> {
    const nomisRecord = await this.prisonerService.getPrisonerDetail(username, prisonerNumber)
    const [staffDetail, deliusRecord, prisonInformation] = await Promise.all([
      this.communityService.getStaffDetail(username),
      this.communityService.getProbationer(prisonerNumber),
      this.prisonerService.getPrisonInformation(username, nomisRecord.agencyId),
    ])

    const offenderManager = deliusRecord.offenderManagers.find(om => om.active)

    const licence = {
      typeCode: 'AP',
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
      standardConditions: getStandardConditions('AP'),
    } as CreateLicenceRequest

    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    return new LicenceApiClient(token).createLicence(licence)
  }

  async getLicence(id: string, username: string): Promise<Licence> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    return new LicenceApiClient(token).getLicenceById(id)
  }

  async updateAppointmentPerson(id: string, formData: PersonName, username: string): Promise<void> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const requestBody = {
      appointmentPerson: formData.contactName,
    } as AppointmentPersonRequest

    return new LicenceApiClient(token).updateAppointmentPerson(id, requestBody)
  }

  async updateAppointmentTime(id: string, formData: SimpleDateTime, username: string): Promise<void> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const appointmentTime = simpleDateTimeToJson(formData)
    const requestBody = { appointmentTime } as AppointmentTimeRequest
    return new LicenceApiClient(token).updateAppointmentTime(id, requestBody)
  }

  async updateAppointmentAddress(id: string, formData: Address, username: string): Promise<void> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const appointmentAddress = addressObjectToString(formData)
    const requestBody = { appointmentAddress } as AppointmentAddressRequest
    return new LicenceApiClient(token).updateAppointmentAddress(id, requestBody)
  }

  async updateContactNumber(id: string, formData: Telephone, username: string): Promise<void> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const requestBody = { comTelephone: formData.telephone } as ContactNumberRequest
    return new LicenceApiClient(token).updateContactNumber(id, requestBody)
  }

  async updateAdditionalConditions(id: string, formData: AdditionalConditions, username: string): Promise<void> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)

    const requestBody = {
      additionalConditions:
        formData.additionalConditions?.map((conditionCode, index) => {
          return {
            code: conditionCode,
            sequence: index,
            category: getAdditionalConditionByCode(conditionCode)?.category,
            text: getAdditionalConditionByCode(conditionCode)?.text,
          }
        }) || [],
    } as AdditionalConditionsRequest

    return new LicenceApiClient(token).updateAdditionalConditions(id, requestBody)
  }

  async updateAdditionalConditionData(
    licenceId: string,
    additionalConditionId: string,
    formData: unknown,
    username: string
  ): Promise<void> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)

    const requestBody = {
      data: Object.keys(formData).map((key, index) => {
        return {
          field: key,
          value: formData[key],
          sequence: index,
        }
      }),
    } as UpdateAdditionalConditionDataRequest

    return new LicenceApiClient(token).updateAdditionalConditionData(licenceId, additionalConditionId, requestBody)
  }

  async updateBespokeConditions(id: string, formData: BespokeConditions, username: string): Promise<void> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const sanitised = formData.conditions.filter((c: string) => c !== null && c.length > 0)
    const requestBody = { conditions: sanitised } as BespokeConditionsRequest
    return new LicenceApiClient(token).updateBespokeConditions(id, requestBody)
  }

  async updateStatus(id: string, newStatus: LicenceStatus, username: string): Promise<void> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const requestBody = { status: newStatus, username } as StatusUpdateRequest
    return new LicenceApiClient(token).updateLicenceStatus(id, requestBody)
  }

  async getLicencesByStaffIdAndStatus(
    staffId: number,
    username: string,
    statuses: LicenceStatus[]
  ): Promise<LicenceSummary[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    return new LicenceApiClient(token).getLicencesByStaffIdAndStatus(staffId, statuses)
  }

  async getLicencesForApproval(username: string, prisons: string[]): Promise<LicenceSummary[]> {
    const statuses = [LicenceStatus.SUBMITTED.valueOf()]
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const filteredPrisons = filterCentralCaseload(prisons)
    return new LicenceApiClient(token).matchLicences(filteredPrisons, statuses)
  }

  async getLicencesForPrinting(
    username: string,
    authSource: string,
    prisons: string[] = [],
    staffId: number = null
  ): Promise<LicenceSummary[]> {
    const statuses = [LicenceStatus.ACTIVE.valueOf(), LicenceStatus.APPROVED.valueOf()]
    if (authSource === 'nomis') {
      const token = await this.hmppsAuthClient.getSystemClientToken(username)
      const filteredPrisons = filterCentralCaseload(prisons)
      return new LicenceApiClient(token).matchLicences(filteredPrisons, statuses)
    }
    if (authSource === 'delius') {
      const token = await this.hmppsAuthClient.getSystemClientToken(username)
      return new LicenceApiClient(token).matchLicences([], statuses, [staffId])
    }
    return []
  }

  getLicenceForPdf(): Record<string, unknown> {
    return {
      licenceId: 1,
      licenceType: 'AP',
      lastName: 'Harrison',
      firstName: 'Tim',
      dateOfBirth: '11/02/1970',
      prisonId: 'MDI',
      prisonDescription: 'HMP Moorland',
      roLastName: 'Smith',
      roFirstName: 'Sarah',
      roEmail: 'sarah.smith@nps.north.gov.uk',
      roTelephone: '0161 234 234',
      nomsId: 'A1234AG',
      pnc: '2015/1234344',
    }
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
