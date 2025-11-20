import { addDays, format } from 'date-fns'
import { User } from '../../@types/CvlUserDetails'
import { CaCase, TimeServedCaseload } from '../../@types/licenceApiClientTypes'
import CaCaseloadService from './caCaseloadService'
import LicenceApiClient from '../../data/licenceApiClient'

jest.mock('../../data/licenceApiClient')

describe('Caseload Service', () => {
  const probationPractitioner = {
    name: 'Joe Bloggs',
    staffCode: 'X1234',
  }
  const licenceApiClient = new LicenceApiClient(null) as jest.Mocked<LicenceApiClient>
  const serviceUnderTest = new CaCaseloadService(licenceApiClient)

  const user = {
    deliusStaffIdentifier: 2000,
    probationTeamCodes: ['teamA', 'teamB'],
    prisonCaseload: ['p1', 'p2'],
  } as User

  const caCase = {
    kind: 'CRD',
    licenceId: 2,
    name: 'Another Person',
    prisonerNumber: 'AB1234E',
    probationPractitioner,
    releaseDate: format(addDays(new Date(), 2), 'dd MMM yyy'),
    releaseDateLabel: 'Confirmed release date',
    licenceStatus: 'IN_PROGRESS',
    tabType: 'RELEASES_IN_NEXT_TWO_WORKING_DAYS',
    nomisLegalStatus: 'SENTENCED',
    lastWorkedOnBy: 'X Y',
    isInHardStopPeriod: false,
  } as CaCase

  const caseload = [caCase]

  beforeEach(() => {
    licenceApiClient.getPrisonOmuCaseload.mockResolvedValue(caseload)
    licenceApiClient.getProbationOmuCaseload.mockResolvedValue([{ ...caCase, tabType: null }])
  })

  afterEach(() => {
    jest.resetAllMocks()
  })
  describe('Probation tab caseload', () => {
    it('should return prison caseload', async () => {
      const result = await serviceUnderTest.getPrisonOmuCaseload(user, ['BAI'], '')
      expect(result).toMatchObject(caseload)
    })
  })

  describe('Probation tab caseload', () => {
    it('should return prison caseload', async () => {
      const result = await serviceUnderTest.getProbationOmuCaseload(user, ['BAI'], '')
      expect(result).toMatchObject([{ ...caCase, tabType: null }])
    })
  })

  describe('Time Served cases', () => {
    it('should return time served caseload', async () => {
      const response: TimeServedCaseload = {
        otherCases: [],
        identifiedCases: [
          {
            name: 'Some Person',
            nomisLegalStatus: 'SENTENCED',
            prisonCode: 'MDI',
            prisonerNumber: 'A1234AA',
            probationPractitioner: { name: 'Probation User' },
            releaseDate: '12/12/2024',
            isTimeServedCase: true,
            isTimeServedCaseByAllPrisonRule: true,
            isTimeServedCaseByCrdsRule: true,
            isTimeServedCaseByNonCrdsRule: true,
            isTimeServedCaseByIgnoreArdRule: true,
            conditionalReleaseDate: '01/02/2024',
            conditionalReleaseDateOverride: '02/02/2024',
            confirmedReleaseDate: '03/02/2024',
            sentenceStartDate: '04/02/2024',
            isTimeServedCaseByIgnoreArdRule: false,
          },
        ],
      }
      licenceApiClient.getTimeServedCases.mockResolvedValue(response)
      const result = await serviceUnderTest.getTimeServedCases(user, 'BAI')
      expect(result).toMatchObject(response)
    })
  })
})
