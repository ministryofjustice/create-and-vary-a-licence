import type HmppsAuthClient from '../data/hmppsAuthClient'
import {
  AppointmentPersonRequest,
  AppointmentTimeRequest,
  ContactNumberRequest,
  CreateLicenceRequest,
  CreateLicenceResponse,
  Licence,
  LicenceApiTestData,
} from '../data/licenceApiClientTypes'
import LicenceApiClient from '../data/licenceApiClient'
import { getStandardConditions } from '../utils/conditionsProvider'
import { simpleDateTimeToJson } from '../utils/utils'
import logger from '../../logger'
import PersonName from '../routes/creatingLicences/types/personName'
import SimpleDateTime from '../routes/creatingLicences/types/simpleDateTime'
import Telephone from '../routes/creatingLicences/types/telephone'

export default class LicenceService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  async getTestData(username: string): Promise<LicenceApiTestData[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    return new LicenceApiClient(token).getTestData()
  }

  async createLicence(username: string): Promise<CreateLicenceResponse> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    // TODO construct with real licence data using prison and community APIs
    const licence = {
      typeCode: 'AP',
      version: '1.0',
      nomsId: Math.floor(Math.random() * 900000 + 100).toString(), // Generate random nomsId for now ... should be unique ID from nomis later
      bookingNo: '12334',
      bookingId: 87666,
      crn: 'X12344',
      pnc: '2014/12344A',
      cro: '2014/12344A',
      prisonCode: 'MDI',
      prisonDescription: 'Leeds (HMP)',
      prisonTelephone: '+44 276 54545',
      forename: 'Adam',
      middleNames: 'Jason Kyle',
      surname: 'Balasaravika',
      dateOfBirth: '14/09/2021',
      conditionalReleaseDate: '14/09/2021',
      actualReleaseDate: '14/09/2021',
      sentenceStartDate: '14/09/2021',
      sentenceEndDate: '14/09/2021',
      licenceStartDate: '14/09/2021',
      licenceExpiryDate: '14/09/2021',
      comFirstName: 'Paula',
      comLastName: 'Wells',
      comUsername: 'X1233',
      comStaffId: 44553343,
      comEmail: 'paula.wells@northeast.probation.gov.uk',
      comTelephone: '07876 443554',
      probationAreaCode: 'N01',
      probationLduCode: 'LDU1332',
      standardConditions: getStandardConditions(),
    } as CreateLicenceRequest
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

  async updateContactNumber(id: string, formData: Telephone, username: string): Promise<void> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const requestBody = { comTelephone: formData.telephone } as ContactNumberRequest
    return new LicenceApiClient(token).updateContactNumber(id, requestBody)
  }

  getLicenceStub(): Record<string, unknown> {
    return {
      offender: {
        name: 'Adam Balasaravika',
        prison: 'Brixton Prison',
      },
      induction: {
        name: 'Joe Bloggs',
        address: {
          line1: 'Fake House',
          line2: 'Fake Street',
          city: 'Fakestown',
          county: 'Durham',
          postcode: 'LE123UT',
        },
        telephone: '07712345678',
        date: '31st May 2021',
        time: '5:30pm',
      },
      additionalConditions: [
        {
          category: 'Restriction of residency',
          template:
            'Not to reside (not even to stay for one night) in the same household as [ANY / ANY FEMALE / ANY MALE] child under the age of [INSERT AGE] without the prior approval of your supervising officer.',
          data: ['Any child under 18'],
        },
        {
          category: 'Contact with a person',
          template:
            'Not to have unsupervised contact with [ANY / ANY FEMALE / ANY MALE] children under the age of [INSERT AGE] without the prior approval of your supervising officer and / or [INSERT NAME OF APPROPRIATE SOCIAL SERVICES DEPARTMENT] except where that contact is inadvertent and not reasonably avoidable in the course of lawful daily life.',
          data: ['Any children under 18', 'Lewisham Social Services'],
        },
      ],
      bespokeConditions: ['You must not enter Tesco supermarket 290, 290A Lewisham Road, London, SE13 7PA'],
    }
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
    logger.debug(`getCaseload for ${username}  staffId: ${staffId}`)
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
