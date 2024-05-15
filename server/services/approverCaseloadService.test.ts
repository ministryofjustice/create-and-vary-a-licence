import CommunityService from './communityService'
import LicenceApiClient from '../data/licenceApiClient'
import type { User } from '../@types/CvlUserDetails'
import type { OffenderDetail } from '../@types/probationSearchApiClientTypes'
import LicenceStatus from '../enumeration/licenceStatus'
import LicenceType from '../enumeration/licenceType'
import ApproverCaseloadService from './approverCaseloadService'
import type { CaseloadItem, CvlFields, CvlPrisoner, LicenceSummaryApproverView } from '../@types/licenceApiClientTypes'
import { parseIsoDate } from '../utils/utils'

jest.mock('./communityService')
jest.mock('./licenceService')
jest.mock('../data/licenceApiClient')

const communityOffender = {
  otherIds: { nomsNumber: 'AB1234E', crn: 'X12348' },
  offenderManagers: [{ active: true, staff: { forenames: 'Joe', surname: 'Bloggs', code: 'X1234' } }],
} as OffenderDetail

describe('Approval Caseload Service', () => {
  const communityService = new CommunityService(null, null) as jest.Mocked<CommunityService>
  const licenceApiClient = new LicenceApiClient(null) as jest.Mocked<LicenceApiClient>

  const serviceUnderTest = new ApproverCaseloadService(communityService, licenceApiClient)
  const user = {
    deliusStaffIdentifier: 2000,
    probationTeamCodes: ['teamA', 'teamB'],
    prisonCaseload: ['p1', 'p2'],
  } as User

  const caseloadItem = {
    prisoner: {
      prisonerNumber: 'AB1234E',
      conditionalReleaseDate: '2024-05-25',
      firstName: 'THE',
      lastName: 'PRISONER',
      status: 'ACTIVE IN',
    } as CvlPrisoner,
    cvl: {} as CvlFields,
  } as CaseloadItem

  const staffDetails = {
    username: 'joebloggs',
    staffCode: 'X1234',
    staff: {
      forenames: 'Joe',
      surname: 'Bloggs',
    },
  }

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('approval needed', () => {
    const licence = {
      kind: 'CRD',
      nomisId: 'AB1234E',
      licenceId: 1,
      licenceType: LicenceType.AP,
      licenceStatus: LicenceStatus.SUBMITTED,
      submittedByFullName: 'An Submitter',
      comUsername: 'joebloggs',
      isReviewNeeded: false,
      isInHardStopPeriod: false,
      isDueForEarlyRelease: true,
      isDueToBeReleasedInTheNextTwoWorkingDays: false,
    } as LicenceSummaryApproverView

    it('builds the approval needed caseload', async () => {
      licenceApiClient.getLicencesForApproval.mockResolvedValue([licence])
      communityService.getOffendersByNomsNumbers.mockResolvedValue([communityOffender])
      licenceApiClient.searchPrisonersByNomsIds.mockResolvedValue([caseloadItem])
      communityService.getStaffDetailsByUsernameList.mockResolvedValue([staffDetails])

      const result = await serviceUnderTest.getApprovalNeeded(user, [], undefined)

      expect(result).toMatchObject([
        {
          licenceId: 1,
          approvedBy: undefined,
          approvedOn: undefined,
          isDueForEarlyRelease: true,
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
        },
      ])
    })
  })

  describe('recently approved', () => {
    const licence = {
      kind: 'CRD',
      nomisId: 'AB1234E',
      licenceId: 1,
      licenceType: LicenceType.AP,
      licenceStatus: LicenceStatus.SUBMITTED,
      comUsername: 'joebloggs',
      approvedByName: 'Jim Smith',
      approvedDate: '25/04/2014 07:45:59',
      submittedByFullName: 'An Submitter',
      isReviewNeeded: false,
      isInHardStopPeriod: false,
      isDueForEarlyRelease: false,
      isDueToBeReleasedInTheNextTwoWorkingDays: false,
    } as LicenceSummaryApproverView

    const expectedResult = {
      licenceId: 1,
      approvedBy: 'Jim Smith',
      approvedOn: '25 April 2014',
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
    }

    it('builds the recently approved caseload', async () => {
      licenceApiClient.getLicencesRecentlyApproved.mockResolvedValue([licence])
      communityService.getOffendersByNomsNumbers.mockResolvedValue([communityOffender])
      licenceApiClient.searchPrisonersByNomsIds.mockResolvedValue([caseloadItem])
      communityService.getStaffDetailsByUsernameList.mockResolvedValue([staffDetails])

      const result = await serviceUnderTest.getRecentlyApproved(user, [], undefined)

      expect(result).toStrictEqual([expectedResult])
    })

    it('handles missing release dates', async () => {
      licenceApiClient.getLicencesRecentlyApproved.mockResolvedValue([licence])
      communityService.getOffendersByNomsNumbers.mockResolvedValue([communityOffender])
      licenceApiClient.searchPrisonersByNomsIds.mockResolvedValue([
        {
          ...caseloadItem,
          prisoner: { ...caseloadItem.prisoner, conditionalReleaseDate: undefined, confirmedReleaseDate: undefined },
        },
      ])
      communityService.getStaffDetailsByUsernameList.mockResolvedValue([staffDetails])

      const result = await serviceUnderTest.getRecentlyApproved(user, [], undefined)

      expect(result).toStrictEqual([{ ...expectedResult, releaseDate: 'not found', sortDate: null }])
    })

    it('derives if urgent approval is needed', async () => {
      licenceApiClient.getLicencesRecentlyApproved.mockResolvedValue([
        { ...licence, isDueToBeReleasedInTheNextTwoWorkingDays: true },
      ])
      communityService.getOffendersByNomsNumbers.mockResolvedValue([communityOffender])
      licenceApiClient.searchPrisonersByNomsIds.mockResolvedValue([caseloadItem])
      communityService.getStaffDetailsByUsernameList.mockResolvedValue([staffDetails])

      const result = await serviceUnderTest.getRecentlyApproved(user, [], undefined)

      expect(result).toStrictEqual([{ ...expectedResult, urgentApproval: true }])
    })

    it('sort', async () => {
      const aLicence = (nomisId: string): LicenceSummaryApproverView => ({ ...licence, nomisId })

      const aCaseloadItem = (
        nomisId: string,
        conditionalReleaseDate: string,
        confirmedReleaseDate: string
      ): CaseloadItem => ({
        ...caseloadItem,
        prisoner: { ...caseloadItem.prisoner, prisonerNumber: nomisId, conditionalReleaseDate, confirmedReleaseDate },
      })

      const aCommunityOffender = (nomisId: string): OffenderDetail => ({
        ...communityOffender,
        otherIds: { nomsNumber: nomisId, crn: communityOffender.otherIds.crn },
      })

      licenceApiClient.getLicencesRecentlyApproved.mockResolvedValue([
        aLicence('A1234AA'),
        aLicence('B1234AA'),
        aLicence('C1234AA'),
        aLicence('D1234AA'),
      ])

      communityService.getOffendersByNomsNumbers.mockResolvedValue([
        aCommunityOffender('A1234AA'),
        aCommunityOffender('C1234AA'),
        aCommunityOffender('D1234AA'),
        aCommunityOffender('B1234AA'),
      ])
      licenceApiClient.searchPrisonersByNomsIds.mockResolvedValue([
        aCaseloadItem('A1234AA', '2023-01-04', undefined),
        aCaseloadItem('C1234AA', undefined, undefined),
        aCaseloadItem('D1234AA', '2023-01-05', '2023-01-03'),
        aCaseloadItem('B1234AA', '2023-01-02', '2023-01-02'),
      ])
      communityService.getStaffDetailsByUsernameList.mockResolvedValue([staffDetails])

      const result = await serviceUnderTest.getRecentlyApproved(user, [], undefined)

      expect(result.map(a => [a.prisonerNumber, a.releaseDate])).toStrictEqual([
        ['C1234AA', 'not found'],
        ['B1234AA', '02 Jan 2023'],
        ['D1234AA', '03 Jan 2023'],
        ['A1234AA', '04 Jan 2023'],
      ])
    })

    describe('search', () => {
      it('no results', async () => {
        licenceApiClient.getLicencesRecentlyApproved.mockResolvedValue([licence])
        communityService.getOffendersByNomsNumbers.mockResolvedValue([communityOffender])
        licenceApiClient.searchPrisonersByNomsIds.mockResolvedValue([caseloadItem])
        communityService.getStaffDetailsByUsernameList.mockResolvedValue([staffDetails])

        const result = await serviceUnderTest.getRecentlyApproved(user, [], 'aaaa')

        expect(result).toStrictEqual([])
      })

      it('search by partial prison number', async () => {
        licenceApiClient.getLicencesRecentlyApproved.mockResolvedValue([licence])
        communityService.getOffendersByNomsNumbers.mockResolvedValue([communityOffender])
        licenceApiClient.searchPrisonersByNomsIds.mockResolvedValue([caseloadItem])
        communityService.getStaffDetailsByUsernameList.mockResolvedValue([staffDetails])

        const result = await serviceUnderTest.getRecentlyApproved(
          user,
          [],
          caseloadItem.prisoner.prisonerNumber.substring(1, 4)
        )

        expect(result).toStrictEqual([expectedResult])
      })

      it('search by partial prisoner name', async () => {
        licenceApiClient.getLicencesRecentlyApproved.mockResolvedValue([licence])
        communityService.getOffendersByNomsNumbers.mockResolvedValue([communityOffender])
        licenceApiClient.searchPrisonersByNomsIds.mockResolvedValue([caseloadItem])
        communityService.getStaffDetailsByUsernameList.mockResolvedValue([staffDetails])

        const result = await serviceUnderTest.getRecentlyApproved(
          user,
          [],
          caseloadItem.prisoner.lastName.substring(1, 4)
        )

        expect(result).toStrictEqual([expectedResult])
      })

      it('search by partial pp name', async () => {
        licenceApiClient.getLicencesRecentlyApproved.mockResolvedValue([licence])
        communityService.getOffendersByNomsNumbers.mockResolvedValue([communityOffender])
        licenceApiClient.searchPrisonersByNomsIds.mockResolvedValue([caseloadItem])
        communityService.getStaffDetailsByUsernameList.mockResolvedValue([staffDetails])

        const result = await serviceUnderTest.getRecentlyApproved(user, [], staffDetails.staff.surname.substring(1, 3))

        expect(result).toStrictEqual([expectedResult])
      })
    })
  })
})
