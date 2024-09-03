import { addDays, format } from 'date-fns'
import CaseloadService from './caseloadService'
import CommunityService from '../communityService'
import LicenceService from '../licenceService'
import { User } from '../../@types/CvlUserDetails'
import { OffenderDetail } from '../../@types/probationSearchApiClientTypes'
import LicenceStatus from '../../enumeration/licenceStatus'
import LicenceType from '../../enumeration/licenceType'
import { CaseloadItem, LicenceSummary } from '../../@types/licenceApiClientTypes'

jest.mock('../communityService')
jest.mock('../licenceService')

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

  const licence = {
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
    dateCreated: '12/01/2024 10:45',
  } as LicenceSummary

  const offenderDetail = {
    otherIds: { nomsNumber: 'AB1234E', crn: 'X12348' },
    offenderManagers: [{ active: true, staff: { forenames: 'Joe', surname: 'Bloggs', code: 'X1234' } }],
  } as OffenderDetail

  const caseloadItem = {
    prisoner: {
      firstName: 'Bob',
      lastName: 'Smith',
      prisonerNumber: 'AB1234E',
      confirmedReleaseDate: tenDaysFromNow,
      status: 'INACTIVE OUT',
      releaseDate: '2023-01-24',
    },
    cvl: {},
  } as CaseloadItem

  const staffDetail = {
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

  it('builds the vary approver caseload', async () => {
    licenceService.getLicencesForVariationApproval.mockResolvedValue([licence])
    communityService.getOffendersByNomsNumbers.mockResolvedValue([offenderDetail])
    licenceService.searchPrisonersByNomsIds.mockResolvedValue([caseloadItem])
    communityService.getStaffDetailsByUsernameList.mockResolvedValue([staffDetail])

    const result = await serviceUnderTest.getVaryApproverCaseload(user, '')

    expect(result).toStrictEqual([
      {
        crnNumber: 'X12348',
        licenceId: 1,
        licenceType: 'PSS',
        name: 'Bob Smith',
        releaseDate: '24 Jan 2023',
        variationRequestDate: '12 January 2024',
        probationPractitioner: {
          staffCode: 'X1234',
          name: 'Joe Bloggs',
        },
      },
    ])
  })

  it('builds the vary approver caseload for region', async () => {
    licenceService.getLicencesForVariationApprovalByRegion.mockResolvedValue([licence])
    communityService.getOffendersByNomsNumbers.mockResolvedValue([offenderDetail])
    licenceService.searchPrisonersByNomsIds.mockResolvedValue([caseloadItem])
    communityService.getStaffDetailsByUsernameList.mockResolvedValue([staffDetail])

    const result = await serviceUnderTest.getVaryApproverCaseloadByRegion(user, '')

    expect(result).toStrictEqual([
      {
        crnNumber: 'X12348',
        licenceId: 1,
        licenceType: 'PSS',
        name: 'Bob Smith',
        releaseDate: '24 Jan 2023',
        variationRequestDate: '12 January 2024',
        probationPractitioner: {
          staffCode: 'X1234',
          name: 'Joe Bloggs',
        },
      },
    ])
  })

  it('handles missing release date', async () => {
    licenceService.getLicencesForVariationApproval.mockResolvedValue([licence])
    communityService.getOffendersByNomsNumbers.mockResolvedValue([offenderDetail])
    licenceService.searchPrisonersByNomsIds.mockResolvedValue([
      { ...caseloadItem, prisoner: { ...caseloadItem.prisoner, releaseDate: undefined } },
    ])
    communityService.getStaffDetailsByUsernameList.mockResolvedValue([staffDetail])

    const result = await serviceUnderTest.getVaryApproverCaseload(user, '')

    expect(result).toStrictEqual([
      {
        crnNumber: 'X12348',
        licenceId: 1,
        licenceType: 'PSS',
        name: 'Bob Smith',
        releaseDate: null,
        variationRequestDate: '12 January 2024',
        probationPractitioner: {
          staffCode: 'X1234',
          name: 'Joe Bloggs',
        },
      },
    ])
  })

  describe('search', () => {
    it('should successfully search by name', async () => {
      licenceService.getLicencesForVariationApproval.mockResolvedValue([licence])
      communityService.getOffendersByNomsNumbers.mockResolvedValue([offenderDetail])
      licenceService.searchPrisonersByNomsIds.mockResolvedValue([caseloadItem])
      communityService.getStaffDetailsByUsernameList.mockResolvedValue([staffDetail])

      const result = await serviceUnderTest.getVaryApproverCaseload(user, 'bOB')

      expect(result).toStrictEqual([
        {
          crnNumber: 'X12348',
          licenceId: 1,
          licenceType: 'PSS',
          name: 'Bob Smith',
          releaseDate: '24 Jan 2023',
          variationRequestDate: '12 January 2024',
          probationPractitioner: {
            staffCode: 'X1234',
            name: 'Joe Bloggs',
          },
        },
      ])
    })

    it('should successfully search by crn', async () => {
      licenceService.getLicencesForVariationApproval.mockResolvedValue([licence])
      communityService.getOffendersByNomsNumbers.mockResolvedValue([offenderDetail])
      licenceService.searchPrisonersByNomsIds.mockResolvedValue([caseloadItem])
      communityService.getStaffDetailsByUsernameList.mockResolvedValue([staffDetail])

      const result = await serviceUnderTest.getVaryApproverCaseload(user, 'x12348')

      expect(result).toStrictEqual([
        {
          crnNumber: 'X12348',
          licenceId: 1,
          licenceType: 'PSS',
          name: 'Bob Smith',
          releaseDate: '24 Jan 2023',
          variationRequestDate: '12 January 2024',
          probationPractitioner: {
            staffCode: 'X1234',
            name: 'Joe Bloggs',
          },
        },
      ])
    })

    it('should successfully search by crn', async () => {
      licenceService.getLicencesForVariationApproval.mockResolvedValue([licence])
      communityService.getOffendersByNomsNumbers.mockResolvedValue([offenderDetail])
      licenceService.searchPrisonersByNomsIds.mockResolvedValue([caseloadItem])
      communityService.getStaffDetailsByUsernameList.mockResolvedValue([staffDetail])

      const result = await serviceUnderTest.getVaryApproverCaseload(user, 'lOg')

      expect(result).toStrictEqual([
        {
          crnNumber: 'X12348',
          licenceId: 1,
          licenceType: 'PSS',
          name: 'Bob Smith',
          releaseDate: '24 Jan 2023',
          variationRequestDate: '12 January 2024',
          probationPractitioner: {
            staffCode: 'X1234',
            name: 'Joe Bloggs',
          },
        },
      ])
    })

    it('should fail to find when no match', async () => {
      licenceService.getLicencesForVariationApproval.mockResolvedValue([licence])
      communityService.getOffendersByNomsNumbers.mockResolvedValue([offenderDetail])
      licenceService.searchPrisonersByNomsIds.mockResolvedValue([caseloadItem])
      communityService.getStaffDetailsByUsernameList.mockResolvedValue([staffDetail])

      const result = await serviceUnderTest.getVaryApproverCaseload(user, 'XsXccssZx')

      expect(result).toStrictEqual([])
    })
  })
})
