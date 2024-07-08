import { addDays, format } from 'date-fns'
import CaseloadService from './caseloadService'
import CommunityService from '../communityService'
import LicenceService from '../licenceService'
import { User } from '../../@types/CvlUserDetails'
import { OffenderDetail } from '../../@types/probationSearchApiClientTypes'
import LicenceStatus from '../../enumeration/licenceStatus'
import LicenceType from '../../enumeration/licenceType'
import { CaseloadItem } from '../../@types/licenceApiClientTypes'

jest.mock('../communityService')

describe('Caseload Service', () => {
  const tenDaysFromNow = format(addDays(new Date(), 10), 'yyyy-MM-dd')
  const communityService = new CommunityService(null, null) as jest.Mocked<CommunityService>
  const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>
  const serviceUnderTest = new CaseloadService(communityService, licenceService)
  const user = {
    deliusStaffIdentifier: 2000,
    probationTeamCodes: ['teamA', 'teamB'],
    prisonCaseload: ['p1', 'p2'],
  } as User

  beforeEach(() => {
    communityService.getManagedOffenders.mockResolvedValue([])
    communityService.getManagedOffendersByTeam.mockResolvedValue([])
    communityService.getOffendersByCrn.mockResolvedValue([])
    communityService.getStaffDetailsByUsernameList.mockResolvedValue([])
    licenceService.getLicencesByNomisIdsAndStatus = jest.fn().mockResolvedValue([])
    licenceService.searchPrisonersByReleaseDate = jest.fn().mockResolvedValue([])
    licenceService.searchPrisonersByNomsIds = jest.fn().mockResolvedValue([])
    licenceService.getLicencesForVariationApproval = jest.fn().mockResolvedValue([])
    licenceService.getLicencesForOmu = jest.fn().mockResolvedValue([])
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
    communityService.getOffendersByNomsNumbers.mockResolvedValue([
      {
        otherIds: { nomsNumber: 'AB1234E', crn: 'X12348' },
        offenderManagers: [{ active: true, staff: { forenames: 'Joe', surname: 'Bloggs', code: 'X1234' } }],
      } as OffenderDetail,
    ])
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
    communityService.getStaffDetailsByUsernameList.mockResolvedValue([
      {
        username: 'joebloggs',
        staffCode: 'X1234',
        staff: {
          forenames: 'Joe',
          surname: 'Bloggs',
        },
      },
    ])

    const result = await serviceUnderTest.getVaryApproverCaseload(user)

    expect(result).toMatchObject([
      {
        deliusRecord: {
          otherIds: {
            nomsNumber: 'AB1234E',
            crn: 'X12348',
          },
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
