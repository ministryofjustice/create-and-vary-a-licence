import { addDays, format } from 'date-fns'
import CaseloadService from './caseloadService'
import ProbationService from '../probationService'
import LicenceService from '../licenceService'
import { User } from '../../@types/CvlUserDetails'
import LicenceStatus from '../../enumeration/licenceStatus'
import LicenceType from '../../enumeration/licenceType'
import { CaseloadItem } from '../../@types/licenceApiClientTypes'

jest.mock('../probationService')

describe('Caseload Service', () => {
  const tenDaysFromNow = format(addDays(new Date(), 10), 'yyyy-MM-dd')
  const deliusService = new ProbationService(null) as jest.Mocked<ProbationService>
  const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>
  const serviceUnderTest = new CaseloadService(deliusService, licenceService)
  const user = {
    deliusStaffIdentifier: 2000,
    probationTeamCodes: ['teamA', 'teamB'],
    prisonCaseload: ['p1', 'p2'],
  } as User

  beforeEach(() => {
    licenceService.searchPrisonersByNomsIds = jest.fn().mockResolvedValue([])
    licenceService.getLicencesForVariationApproval = jest.fn().mockResolvedValue([])
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('builds the vary approver caseload', async () => {
    licenceService.getLicencesForVariationApproval.mockResolvedValue([
      {
        kind: 'VARIATION',
        nomisId: 'AB1234E',
        licenceId: 1,
        licenceType: LicenceType.PSS,
        licenceStatus: LicenceStatus.VARIATION_SUBMITTED,
        comUsername: 'joebloggs',
        isReviewNeeded: false,
        isDueForEarlyRelease: false,
        isInHardStopPeriod: false,
        isDueToBeReleasedInTheNextTwoWorkingDays: false,
      },
    ])
    deliusService.getProbationers.mockResolvedValue([{ nomisId: 'AB1234E', crn: 'X12348' }])
    licenceService.searchPrisonersByNomsIds.mockResolvedValue([
      {
        prisoner: {
          prisonerNumber: 'AB1234E',
          confirmedReleaseDate: tenDaysFromNow,
          status: 'INACTIVE OUT',
        },
        cvl: {},
      } as CaseloadItem,
    ])
    deliusService.getStaffDetailsByUsernameList.mockResolvedValue([
      {
        id: 1,
        username: 'joebloggs',
        code: 'X1234',
        name: {
          forename: 'Joe',
          surname: 'Bloggs',
        },
      },
    ])

    const result = await serviceUnderTest.getVaryApproverCaseload(user)

    expect(result).toMatchObject([
      {
        deliusRecord: {
          nomisId: 'AB1234E',
          crn: 'X12348',
        },
        nomisRecord: {
          prisonerNumber: 'AB1234E',
          confirmedReleaseDate: tenDaysFromNow,
        },
        licences: [
          {
            id: 1,
            type: 'PSS',
            status: 'VARIATION_SUBMITTED',
            comUsername: 'joebloggs',
          },
        ],
        probationPractitioner: {
          staffCode: 'X1234',
          name: 'Joe Bloggs',
        },
      },
    ])
  })
})
