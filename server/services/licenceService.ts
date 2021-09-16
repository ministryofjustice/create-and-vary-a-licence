import type HmppsAuthClient from '../data/hmppsAuthClient'
import { LicenceApiTestData } from '../data/licenceApiClientTypes'
import LicenceApiClient from '../data/licenceApiClient'
import logger from '../../logger'

export default class LicenceService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  async getTestData(username: string): Promise<LicenceApiTestData[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    return new LicenceApiClient(token).getTestData()
  }

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

  /**
   * Build the list for the staff caseload view.
   * Return the caseload for this staff member, merged with the licences which exist for these people.
   * Only concerned with licences that have a statusCode in (CREATED, SUBMITTED, REJECTED, ACTIVE) - ignore SUPERSEDED.
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
