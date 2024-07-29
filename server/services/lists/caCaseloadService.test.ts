import { addDays, format } from 'date-fns'
import { User } from '../../@types/CvlUserDetails'
import { CaCase } from '../../@types/licenceApiClientTypes'
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
    name: 'Steve Cena',
    prisonerNumber: 'AB1234E',
    probationPractitioner,
    releaseDate: format(addDays(new Date(), 2), 'dd MMM yyy'),
    releaseDateLabel: 'Confirmed release date',
    licenceStatus: 'IN_PROGRESS',
    tabType: 'RELEASES_IN_NEXT_TWO_WORKING_DAYS',
    nomisLegalStatus: 'SENTENCED',
    lastWorkedOnBy: 'X Y',
    isDueForEarlyRelease: true,
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
})
