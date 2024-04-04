import { addDays, format } from 'date-fns'
import PrisonerService from './prisonerService'
import CommunityService from './communityService'
import LicenceApiClient from '../data/licenceApiClient'
import { User } from '../@types/CvlUserDetails'
import { OffenderDetail } from '../@types/probationSearchApiClientTypes'
import { Prisoner } from '../@types/prisonerSearchApiClientTypes'
import LicenceStatus from '../enumeration/licenceStatus'
import LicenceType from '../enumeration/licenceType'
import ApproverCaseloadService from './approverCaseloadService'

jest.mock('./prisonerService')
jest.mock('./communityService')
jest.mock('../data/licenceApiClient')

describe('Approval Caseload Service', () => {
  const tenDaysFromNow = format(addDays(new Date(), 10), 'yyyy-MM-dd')

  const prisonerService = new PrisonerService(null, null) as jest.Mocked<PrisonerService>
  const communityService = new CommunityService(null, null) as jest.Mocked<CommunityService>
  const licenceApiClient = new LicenceApiClient(null) as jest.Mocked<LicenceApiClient>

  const serviceUnderTest = new ApproverCaseloadService(prisonerService, communityService, licenceApiClient)
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
    prisonerService.searchPrisonersByNomisIds.mockResolvedValue([])
    prisonerService.getHdcStatuses.mockResolvedValue([])
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('builds the approval needed caseload', async () => {
    jest.spyOn(licenceApiClient, 'getLicencesForApproval').mockResolvedValue([
      {
        kind: 'CRD',
        nomisId: 'AB1234E',
        licenceId: 1,
        licenceType: LicenceType.AP,
        licenceStatus: LicenceStatus.SUBMITTED,
        comUsername: 'joebloggs',
        isReviewNeeded: false,
      },
    ])
    communityService.getOffendersByNomsNumbers.mockResolvedValue([
      {
        otherIds: { nomsNumber: 'AB1234E', crn: 'X12348' },
        offenderManagers: [{ active: true, staff: { forenames: 'Joe', surname: 'Bloggs', code: 'X1234' } }],
      } as OffenderDetail,
    ])
    prisonerService.searchPrisonersByNomisIds.mockResolvedValue([
      { prisonerNumber: 'AB1234E', conditionalReleaseDate: tenDaysFromNow, status: 'ACTIVE IN' } as Prisoner,
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

    const result = await serviceUnderTest.getApprovalNeeded(user, [])

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
          conditionalReleaseDate: tenDaysFromNow,
        },
        licences: [
          {
            id: 1,
            type: 'AP',
            status: 'SUBMITTED',
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

  it('builds the recently approved caseload', async () => {
    jest.spyOn(licenceApiClient, 'getLicencesRecentlyApproved').mockResolvedValue([
      {
        kind: 'CRD',
        nomisId: 'AB1234E',
        licenceId: 1,
        licenceType: LicenceType.AP,
        licenceStatus: LicenceStatus.SUBMITTED,
        comUsername: 'joebloggs',
        approvedByName: 'Jim Smith',
        approvedDate: '25/04/2014 07:45:59',
        isReviewNeeded: false,
      },
    ])
    communityService.getOffendersByNomsNumbers.mockResolvedValue([
      {
        otherIds: { nomsNumber: 'AB1234E', crn: 'X12348' },
        offenderManagers: [{ active: true, staff: { forenames: 'Joe', surname: 'Bloggs', code: 'X1234' } }],
      } as OffenderDetail,
    ])
    prisonerService.searchPrisonersByNomisIds.mockResolvedValue([
      { prisonerNumber: 'AB1234E', conditionalReleaseDate: tenDaysFromNow, status: 'ACTIVE IN' } as Prisoner,
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

    const result = await serviceUnderTest.getRecentlyApproved(user, [])

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
          conditionalReleaseDate: tenDaysFromNow,
        },
        licences: [
          {
            id: 1,
            type: 'AP',
            status: 'SUBMITTED',
            comUsername: 'joebloggs',
            approvedBy: 'Jim Smith',
            approvedDate: '25/04/2014 07:45:59',
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
