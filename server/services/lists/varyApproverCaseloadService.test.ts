import { addDays, format } from 'date-fns'
import VaryApproverCaseloadService from './varyApproverCaseloadService'
import ProbationService from '../probationService'
import LicenceService from '../licenceService'
import { User } from '../../@types/CvlUserDetails'
import LicenceStatus from '../../enumeration/licenceStatus'
import LicenceType from '../../enumeration/licenceType'
import { CaseloadItem } from '../../@types/licenceApiClientTypes'
import { parseIsoDate } from '../../utils/utils'
import { LicenceApiClient } from '../../data'

jest.mock('../probationService')
jest.mock('../licenceService')
jest.mock('../../data')

describe('Caseload Service', () => {
  const tenDaysFromNow = format(addDays(new Date(), 10), 'yyyy-MM-dd')
  const tenDaysFromNowCvlFormat = format(addDays(new Date(), 10), 'dd/MM/yyyy')
  const deliusService = new ProbationService(null) as jest.Mocked<ProbationService>
  const licenceApiClient = new LicenceApiClient(null) as jest.Mocked<LicenceApiClient>
  const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>
  const serviceUnderTest = new VaryApproverCaseloadService(deliusService, licenceApiClient, licenceService)
  const user = {
    deliusStaffIdentifier: 2000,
    probationTeamCodes: ['teamA', 'teamB'],
    prisonCaseload: ['p1', 'p2'],
  } as User

  beforeEach(() => {
    licenceService.searchPrisonersByNomsIds.mockResolvedValue([])
    licenceService.getLicencesForVariationApproval.mockResolvedValue([])
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('builds the vary approver caseload in the frontend', async () => {
    licenceService.getLicencesForVariationApproval.mockResolvedValue([
      {
        kind: 'VARIATION',
        nomisId: 'AB1234E',
        licenceId: 1,
        licenceType: LicenceType.PSS,
        licenceStatus: LicenceStatus.VARIATION_SUBMITTED,
        licenceStartDate: tenDaysFromNowCvlFormat,
        comUsername: 'joebloggs',
        isReviewNeeded: false,
        isInHardStopPeriod: false,
        isDueToBeReleasedInTheNextTwoWorkingDays: false,
      },
    ])
    deliusService.getProbationers.mockResolvedValue([{ nomisId: 'AB1234E', crn: 'X12348' }])
    licenceService.searchPrisonersByNomsIds.mockResolvedValue([
      {
        prisoner: {
          prisonerNumber: 'AB1234E',
          firstName: 'Gary',
          lastName: 'Pittard',
          releaseDate: tenDaysFromNow,
          status: 'INACTIVE OUT',
        },
        licenceStartDate: tenDaysFromNow,
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

    const result = await serviceUnderTest.getVaryApproverCaseload(user, undefined, false)

    expect(result).toMatchObject([
      {
        licenceId: 1,
        name: 'Gary Pittard',
        crnNumber: 'X12348',
        licenceType: 'PSS',
        variationRequestDate: null,
        releaseDate: format(parseIsoDate(tenDaysFromNow), 'dd MMM yyyy'),
        probationPractitioner: 'Joe Bloggs',
      },
    ])
  })

  it('should return empty caseload if search does not match', async () => {
    licenceService.getLicencesForVariationApproval.mockResolvedValue([
      {
        kind: 'VARIATION',
        nomisId: 'AB1234F',
        licenceId: 1,
        licenceType: LicenceType.PSS,
        licenceStatus: LicenceStatus.VARIATION_SUBMITTED,
        comUsername: 'joebloggs',
        isReviewNeeded: false,
        isInHardStopPeriod: false,
        isDueToBeReleasedInTheNextTwoWorkingDays: false,
      },
    ])
    deliusService.getProbationers.mockResolvedValue([{ nomisId: 'AB1234E', crn: 'X12348' }])
    licenceService.searchPrisonersByNomsIds.mockResolvedValue([
      {
        prisoner: {
          prisonerNumber: 'AB1234F',
          firstName: 'Gary',
          lastName: 'Pittard',
          releaseDate: tenDaysFromNow,
          status: 'INACTIVE OUT',
        },
        licenceStartDate: tenDaysFromNow,
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

    const result = await serviceUnderTest.getVaryApproverCaseload(user, 'XXX', false)

    expect(result).toEqual([])
  })

  it('builds the vary approver caseload', async () => {
    licenceApiClient.getVaryApproverCaseload.mockResolvedValue([
      {
        licenceId: 1,
        name: 'An Offender',
        crnNumber: 'X12348',
        licenceType: 'AP',
        variationRequestDate: '30/10/2022',
        releaseDate: '01/11/2022',
        probationPractitioner: 'An ProbationOfficer',
      },
    ])

    const result = await serviceUnderTest.getVaryApproverCaseload(user, undefined, true)

    expect(result).toMatchObject([
      {
        licenceId: 1,
        licenceType: 'AP',
        name: 'An Offender',
        probationPractitioner: 'An ProbationOfficer',
        releaseDate: '01 Nov 2022',
        variationRequestDate: '30 Oct 2022',
      },
    ])
  })
})
