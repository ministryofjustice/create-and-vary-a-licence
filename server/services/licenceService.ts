import type HmppsAuthClient from '../data/hmppsAuthClient'
import { LicenceApiTestData } from '../data/licenceClientTypes'
import LicenceApiClient from '../data/licenceApiClient'

export default class LicenceService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  async getTestData(username: string): Promise<LicenceApiTestData[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    return new LicenceApiClient(token).getTestData()
  }

  // Stubbed data
  getLicence(): Record<string, unknown> {
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
}
