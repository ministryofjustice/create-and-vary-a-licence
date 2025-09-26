import LicenceApiClient from '../../data/licenceApiClient'
import type { User } from '../../@types/CvlUserDetails'
import ApproverCaseloadService from './approverCaseloadService'
import type { ApprovalCase } from '../../@types/licenceApiClientTypes'

jest.mock('../probationService')
jest.mock('../licenceService')
jest.mock('../../data/licenceApiClient')

describe('Approval Caseload Service', () => {
  const licenceApiClient = new LicenceApiClient(null) as jest.Mocked<LicenceApiClient>

  const serviceUnderTest = new ApproverCaseloadService(licenceApiClient)
  const user = {
    deliusStaffIdentifier: 2000,
    probationTeamCodes: ['teamA', 'teamB'],
    prisonCaseload: ['p1', 'p2'],
  } as User

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('search', () => {
    const approvalCase = {
      licenceId: 1,
      approvedBy: 'Jim Smith',
      approvedOn: '25/04/2014 00:00:00',
      name: 'The Prisoner',
      prisonerNumber: 'AB1234E',
      releaseDate: '25/05/2024',
      submittedByFullName: 'An Submitter',
      urgentApproval: false,
      probationPractitioner: {
        staffCode: 'X1234',
        name: 'Joe Bloggs',
      },
    } as ApprovalCase
    it('no results', async () => {
      licenceApiClient.getRecentlyApprovedCaseload.mockResolvedValue([approvalCase])

      const result = await serviceUnderTest.getRecentlyApproved(user, [], 'aaaa')

      expect(result).toStrictEqual([])
    })

    it('search by partial prison number', async () => {
      licenceApiClient.getRecentlyApprovedCaseload.mockResolvedValue([approvalCase])

      const result = await serviceUnderTest.getRecentlyApproved(user, [], 'AB12')

      expect(result).toStrictEqual([approvalCase])
    })

    it('search by partial prisoner name', async () => {
      licenceApiClient.getRecentlyApprovedCaseload.mockResolvedValue([approvalCase])

      const result = await serviceUnderTest.getRecentlyApproved(user, [], 'PRIS')

      expect(result).toStrictEqual([approvalCase])
    })

    it('search by partial pp name', async () => {
      licenceApiClient.getRecentlyApprovedCaseload.mockResolvedValue([approvalCase])

      const result = await serviceUnderTest.getRecentlyApproved(user, [], 'Blog')

      expect(result).toStrictEqual([approvalCase])
    })
  })
})
