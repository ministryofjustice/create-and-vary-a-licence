import LicenceApiClient from '../../data/licenceApiClient'
import type { User } from '../../@types/CvlUserDetails'
import ApproverCaseloadService from './approverCaseloadService'
import type { ApprovalCase } from '../../@types/licenceApiClientTypes'
import { parseIsoDate } from '../../utils/utils'

jest.mock('../communityService')
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

  describe('approval needed', () => {
    const approvalCase = {
      licenceId: 1,
      approvedBy: 'Jim Smith',
      approvedOn: '25 Apr 2014',
      isDueForEarlyRelease: false,
      name: 'The Prisoner',
      prisonerNumber: 'AB1234E',
      releaseDate: '25 May 2024',
      sortDate: parseIsoDate('2024-05-25'),
      submittedByFullName: 'An Submitter',
      urgentApproval: false,
      probationPractitioner: {
        staffCode: 'X1234',
        name: 'Joe Bloggs',
      },
    } as ApprovalCase

    it('builds the approval needed caseload', async () => {
      licenceApiClient.getApprovalCaseload.mockResolvedValue([approvalCase])

      const result = await serviceUnderTest.getApprovalNeeded(user, [], undefined)

      expect(result).toMatchObject([approvalCase])
    })
  })

  describe('recently approved', () => {
    const approvalCase = {
      licenceId: 1,
      approvedBy: 'Jim Smith',
      approvedOn: '25 Apr 2014',
      isDueForEarlyRelease: false,
      name: 'The Prisoner',
      prisonerNumber: 'AB1234E',
      releaseDate: '25 May 2024',
      sortDate: parseIsoDate('2024-05-25'),
      submittedByFullName: 'An Submitter',
      urgentApproval: false,
      probationPractitioner: {
        staffCode: 'X1234',
        name: 'Joe Bloggs',
      },
    } as ApprovalCase

    it('builds the recently approved caseload', async () => {
      licenceApiClient.getRecentlyApprovedCaseload.mockResolvedValue([approvalCase])

      const result = await serviceUnderTest.getRecentlyApproved(user, [], undefined)

      expect(result).toStrictEqual([approvalCase])
    })

    describe('search', () => {
      const approvalCase = {
        licenceId: 1,
        approvedBy: 'Jim Smith',
        approvedOn: '25 Apr 2014',
        isDueForEarlyRelease: false,
        name: 'The Prisoner',
        prisonerNumber: 'AB1234E',
        releaseDate: '25 May 2024',
        sortDate: parseIsoDate('2024-05-25'),
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
})
