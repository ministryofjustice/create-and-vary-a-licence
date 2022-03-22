import moment from 'moment'
import CaseloadService from './caseloadService'
import PrisonerService from './prisonerService'
import CommunityService from './communityService'
import LicenceService from './licenceService'
import { User } from '../@types/CvlUserDetails'
import { OffenderDetail } from '../@types/probationSearchApiClientTypes'
import { Prisoner } from '../@types/prisonerSearchApiClientTypes'
import HdcStatus from '../@types/HdcStatus'
import LicenceStatus from '../enumeration/licenceStatus'
import LicenceType from '../enumeration/licenceType'

jest.mock('./prisonerService')
jest.mock('./communityService')
jest.mock('./licenceService')

describe('Caseload Service', () => {
  const prisonerService = new PrisonerService(null, null) as jest.Mocked<PrisonerService>
  const communityService = new CommunityService(null, null) as jest.Mocked<CommunityService>
  const licenceService = new LicenceService(null, null, null) as jest.Mocked<LicenceService>
  const serviceUnderTest = new CaseloadService(prisonerService, communityService, licenceService)
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
    licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([])
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('filters invalid data due to mismatch between delius and nomis', async () => {
    communityService.getManagedOffenders.mockResolvedValue([
      { offenderCrn: 'X12346' },
      { offenderCrn: 'X12347' },
      { offenderCrn: 'X12348' },
    ])
    communityService.getOffendersByCrn.mockResolvedValue([
      { otherIds: { nomsNumber: 'AB1234D', crn: 'X12346' } } as OffenderDetail,
      { otherIds: { crn: 'X12347' } } as OffenderDetail,
      { otherIds: { nomsNumber: 'AB1234E', crn: 'X12348' } } as OffenderDetail,
    ])
    prisonerService.searchPrisonersByNomisIds.mockResolvedValue([
      { prisonerNumber: 'AB1234E', conditionalReleaseDate: '2022-06-20', status: 'ACTIVE IN' } as Prisoner,
    ])

    const result = await serviceUnderTest.getStaffCreateCaseload(user)
    expect(result).toMatchObject([
      {
        deliusRecord: {
          offenderCrn: 'X12348',
        },
        nomisRecord: {
          prisonerNumber: 'AB1234E',
          conditionalReleaseDate: '2022-06-20',
        },
        licences: [
          {
            status: 'NOT_STARTED',
            type: 'AP',
          },
        ],
      },
    ])
  })

  it('filters offenders who are ineligible for a licence', async () => {
    communityService.getManagedOffenders.mockResolvedValue([
      { offenderCrn: 'X12348' },
      { offenderCrn: 'X12349' },
      { offenderCrn: 'X12350' },
    ])
    communityService.getOffendersByCrn.mockResolvedValue([
      { otherIds: { nomsNumber: 'AB1234E', crn: 'X12348' } } as OffenderDetail,
      { otherIds: { nomsNumber: 'AB1234F', crn: 'X12349' } } as OffenderDetail,
      { otherIds: { nomsNumber: 'AB1234G', crn: 'X12350' } } as OffenderDetail,
    ])
    prisonerService.searchPrisonersByNomisIds.mockResolvedValue([
      { prisonerNumber: 'AB1234E', conditionalReleaseDate: '2022-06-20', status: 'ACTIVE IN' } as Prisoner,
      { prisonerNumber: 'AB1234F', paroleEligibilityDate: '2022-06-20' } as Prisoner,
      { prisonerNumber: 'AB1234G', legalStatus: 'DEAD' } as Prisoner,
      { prisonerNumber: 'AB1234H', indeterminateSentence: true } as Prisoner,
      { prisonerNumber: 'AB1234I' } as Prisoner,
      { prisonerNumber: 'AB1234J', conditionalReleaseDate: '2022-03-20' } as Prisoner,
      { prisonerNumber: 'AB1234K', conditionalReleaseDate: '2022-06-20', bookingId: '123' } as Prisoner,
    ])
    prisonerService.getHdcStatuses.mockResolvedValue([
      {
        bookingId: '123',
        eligibleForHdc: true,
      } as HdcStatus,
    ])

    const result = await serviceUnderTest.getStaffCreateCaseload(user)
    expect(result).toMatchObject([
      {
        deliusRecord: {
          offenderCrn: 'X12348',
        },
        nomisRecord: {
          prisonerNumber: 'AB1234E',
          conditionalReleaseDate: '2022-06-20',
        },
        licences: [
          {
            status: 'NOT_STARTED',
            type: 'AP',
          },
        ],
      },
    ])
  })

  it('builds the staff create caseload', async () => {
    communityService.getManagedOffenders.mockResolvedValue([
      { offenderCrn: 'X12348', staff: { forenames: 'Joe', surname: 'Bloggs', code: 'X1234' } },
      { offenderCrn: 'X12349', staff: { forenames: 'Joe', surname: 'Bloggs', code: 'X1234' } },
      { offenderCrn: 'X12350', staff: { forenames: 'Joe', surname: 'Bloggs', code: 'X1234' } },
      { offenderCrn: 'X12351', staff: { unallocated: true } },
      { offenderCrn: 'X12352', staff: { forenames: 'Joe', surname: 'Bloggs', code: 'X1234' } },
    ])
    communityService.getOffendersByCrn.mockResolvedValue([
      { otherIds: { nomsNumber: 'AB1234E', crn: 'X12348' } } as OffenderDetail,
      { otherIds: { nomsNumber: 'AB1234F', crn: 'X12349' } } as OffenderDetail,
      { otherIds: { nomsNumber: 'AB1234G', crn: 'X12350' } } as OffenderDetail,
      { otherIds: { nomsNumber: 'AB1234H', crn: 'X12351' } } as OffenderDetail,
      { otherIds: { nomsNumber: 'AB1234I', crn: 'X12352' } } as OffenderDetail,
    ])
    prisonerService.searchPrisonersByNomisIds.mockResolvedValue([
      { prisonerNumber: 'AB1234E', conditionalReleaseDate: '2022-06-20', status: 'ACTIVE IN' } as Prisoner,
      { prisonerNumber: 'AB1234F', conditionalReleaseDate: '2022-06-20', status: 'INACTIVE OUT' } as Prisoner,
      { prisonerNumber: 'AB1234G', conditionalReleaseDate: '2022-06-20' } as Prisoner,
      {
        prisonerNumber: 'AB1234H',
        conditionalReleaseDate: '2022-06-20',
        status: 'ACTIVE IN',
        topupSupervisionExpiryDate: '2023-06-22',
      } as Prisoner,
      {
        prisonerNumber: 'AB1234I',
        conditionalReleaseDate: '2022-06-20',
        status: 'ACTIVE IN',
        topupSupervisionExpiryDate: '2023-06-22',
        licenceExpiryDate: '2022-12-20',
      } as Prisoner,
    ])
    licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([
      {
        nomisId: 'AB1234I',
        licenceId: 1,
        licenceType: LicenceType.AP_PSS,
        licenceStatus: LicenceStatus.SUBMITTED,
        comUsername: 'sherlockholmes',
      },
    ])
    communityService.getStaffDetailsByUsernameList.mockResolvedValue([
      {
        username: 'sherlockholmes',
        staffCode: 'X54321',
        staff: {
          forenames: 'Sherlock',
          surname: 'Holmes',
        },
      },
    ])

    const result = await serviceUnderTest.getStaffCreateCaseload(user)
    expect(result).toMatchObject([
      {
        deliusRecord: {
          offenderCrn: 'X12348',
          staff: { forenames: 'Joe', surname: 'Bloggs', code: 'X1234' },
        },
        nomisRecord: {
          prisonerNumber: 'AB1234E',
          conditionalReleaseDate: '2022-06-20',
        },
        licences: [
          {
            status: 'NOT_STARTED',
            type: 'AP',
          },
        ],
        probationPractitioner: {
          name: 'Joe Bloggs',
          staffCode: 'X1234',
        },
      },
      {
        deliusRecord: {
          offenderCrn: 'X12351',
        },
        nomisRecord: {
          prisonerNumber: 'AB1234H',
          conditionalReleaseDate: '2022-06-20',
        },
        licences: [
          {
            status: 'NOT_STARTED',
            type: 'PSS',
          },
        ],
      },
      {
        deliusRecord: {
          offenderCrn: 'X12352',
        },
        nomisRecord: {
          prisonerNumber: 'AB1234I',
          conditionalReleaseDate: '2022-06-20',
        },
        licences: [
          {
            id: 1,
            status: 'SUBMITTED',
            type: 'AP_PSS',
          },
        ],
        probationPractitioner: {
          staffCode: 'X54321',
          name: 'Sherlock Holmes',
        },
      },
    ])
  })

  it('builds the team create caseload', async () => {
    communityService.getManagedOffendersByTeam.mockResolvedValueOnce([
      { offenderCrn: 'X12348', staff: { forenames: 'Joe', surname: 'Bloggs', code: 'X1234' } },
    ])
    communityService.getManagedOffendersByTeam.mockResolvedValueOnce([
      { offenderCrn: 'X12349', staff: { forenames: 'Sherlock', surname: 'Holmes', code: 'X54321' } },
    ])
    communityService.getOffendersByCrn.mockResolvedValue([
      { otherIds: { nomsNumber: 'AB1234E', crn: 'X12348' } } as OffenderDetail,
      { otherIds: { nomsNumber: 'AB1234F', crn: 'X12349' } } as OffenderDetail,
    ])
    prisonerService.searchPrisonersByNomisIds.mockResolvedValue([
      { prisonerNumber: 'AB1234E', conditionalReleaseDate: '2022-06-20', status: 'ACTIVE IN' } as Prisoner,
      { prisonerNumber: 'AB1234F', conditionalReleaseDate: '2022-06-20', status: 'ACTIVE IN' } as Prisoner,
    ])

    const result = await serviceUnderTest.getTeamCreateCaseload(user)
    expect(communityService.getManagedOffendersByTeam).toHaveBeenNthCalledWith(1, 'teamA')
    expect(communityService.getManagedOffendersByTeam).toHaveBeenNthCalledWith(2, 'teamB')
    expect(result).toMatchObject([
      {
        deliusRecord: {
          offenderCrn: 'X12348',
        },
        nomisRecord: {
          prisonerNumber: 'AB1234E',
          conditionalReleaseDate: '2022-06-20',
        },
        licences: [
          {
            status: 'NOT_STARTED',
            type: 'AP',
          },
        ],
        probationPractitioner: {
          staffCode: 'X1234',
          name: 'Joe Bloggs',
        },
      },
      {
        deliusRecord: {
          offenderCrn: 'X12349',
        },
        nomisRecord: {
          prisonerNumber: 'AB1234F',
          conditionalReleaseDate: '2022-06-20',
        },
        licences: [
          {
            status: 'NOT_STARTED',
            type: 'AP',
          },
        ],
        probationPractitioner: {
          staffCode: 'X54321',
          name: 'Sherlock Holmes',
        },
      },
    ])
  })

  it('builds the staff vary caseload', async () => {
    communityService.getManagedOffenders.mockResolvedValue([
      { offenderCrn: 'X12348', staff: { forenames: 'Joe', surname: 'Bloggs', code: 'X1234' } },
    ])
    communityService.getOffendersByCrn.mockResolvedValue([
      { otherIds: { nomsNumber: 'AB1234E', crn: 'X12348' } } as OffenderDetail,
    ])
    prisonerService.searchPrisonersByNomisIds.mockResolvedValue([
      { prisonerNumber: 'AB1234E', conditionalReleaseDate: '2022-06-20', status: 'ACTIVE IN' } as Prisoner,
    ])
    licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([
      {
        nomisId: 'AB1234E',
        licenceId: 1,
        licenceType: LicenceType.AP,
        licenceStatus: LicenceStatus.VARIATION_IN_PROGRESS,
        comUsername: 'sherlockholmes',
      },
    ])
    communityService.getStaffDetailsByUsernameList.mockResolvedValue([
      {
        username: 'sherlockholmes',
        staffCode: 'X54321',
        staff: {
          forenames: 'Sherlock',
          surname: 'Holmes',
        },
      },
    ])

    const result = await serviceUnderTest.getStaffVaryCaseload(user)

    expect(result).toMatchObject([
      {
        deliusRecord: {
          offenderCrn: 'X12348',
        },
        nomisRecord: {
          prisonerNumber: 'AB1234E',
          conditionalReleaseDate: '2022-06-20',
        },
        licences: [
          {
            id: 1,
            status: 'VARIATION_IN_PROGRESS',
            type: 'AP',
            comUsername: 'sherlockholmes',
          },
        ],
        probationPractitioner: {
          staffCode: 'X54321',
          name: 'Sherlock Holmes',
        },
      },
    ])
  })

  it('builds the team vary caseload', async () => {
    communityService.getManagedOffendersByTeam.mockResolvedValueOnce([
      { offenderCrn: 'X12348', staff: { forenames: 'Joe', surname: 'Bloggs', code: 'X1234' } },
    ])
    communityService.getManagedOffendersByTeam.mockResolvedValueOnce([
      { offenderCrn: 'X12349', staff: { forenames: 'Sherlock', surname: 'Holmes', code: 'X54321' } },
    ])
    communityService.getOffendersByCrn.mockResolvedValue([
      { otherIds: { nomsNumber: 'AB1234E', crn: 'X12348' } } as OffenderDetail,
      { otherIds: { nomsNumber: 'AB1234F', crn: 'X12349' } } as OffenderDetail,
    ])
    prisonerService.searchPrisonersByNomisIds.mockResolvedValue([
      { prisonerNumber: 'AB1234E', conditionalReleaseDate: '2022-06-20', status: 'ACTIVE IN' } as Prisoner,
      { prisonerNumber: 'AB1234F', conditionalReleaseDate: '2022-06-20', status: 'ACTIVE IN' } as Prisoner,
    ])
    licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([
      {
        nomisId: 'AB1234E',
        licenceId: 1,
        licenceType: LicenceType.AP,
        licenceStatus: LicenceStatus.VARIATION_IN_PROGRESS,
        comUsername: 'joebloggs',
      },
      {
        nomisId: 'AB1234F',
        licenceId: 2,
        licenceType: LicenceType.AP,
        licenceStatus: LicenceStatus.VARIATION_IN_PROGRESS,
        comUsername: 'sherlockholmes',
      },
    ])
    communityService.getStaffDetailsByUsernameList.mockResolvedValue([
      {
        username: 'sherlockholmes',
        staffCode: 'X54321',
        staff: {
          forenames: 'Sherlock',
          surname: 'Holmes',
        },
      },
      {
        username: 'joebloggs',
        staffCode: 'X1234',
        staff: {
          forenames: 'Joe',
          surname: 'Bloggs',
        },
      },
    ])

    const result = await serviceUnderTest.getTeamVaryCaseload(user)
    expect(communityService.getManagedOffendersByTeam).toHaveBeenNthCalledWith(1, 'teamA')
    expect(communityService.getManagedOffendersByTeam).toHaveBeenNthCalledWith(2, 'teamB')
    expect(result).toMatchObject([
      {
        deliusRecord: {
          offenderCrn: 'X12348',
        },
        nomisRecord: {
          prisonerNumber: 'AB1234E',
          conditionalReleaseDate: '2022-06-20',
        },
        licences: [
          {
            id: 1,
            status: 'VARIATION_IN_PROGRESS',
            type: 'AP',
            comUsername: 'joebloggs',
          },
        ],
        probationPractitioner: {
          staffCode: 'X1234',
          name: 'Joe Bloggs',
        },
      },
      {
        deliusRecord: {
          offenderCrn: 'X12349',
        },
        nomisRecord: {
          prisonerNumber: 'AB1234F',
          conditionalReleaseDate: '2022-06-20',
        },
        licences: [
          {
            id: 2,
            status: 'VARIATION_IN_PROGRESS',
            type: 'AP',
            comUsername: 'sherlockholmes',
          },
        ],
        probationPractitioner: {
          staffCode: 'X54321',
          name: 'Sherlock Holmes',
        },
      },
    ])
  })

  it('builds the omu caseload', async () => {
    prisonerService.searchPrisonersByPrison.mockResolvedValueOnce([
      { prisonerNumber: 'AB1234E', conditionalReleaseDate: '2022-06-20', status: 'ACTIVE IN' } as Prisoner,
    ])
    prisonerService.searchPrisonersByPrison.mockResolvedValueOnce([
      {
        prisonerNumber: 'AB1234F',
        conditionalReleaseDate: moment().add(4, 'weeks').format('YYYY-MM-DD'),
        status: 'ACTIVE IN',
      } as Prisoner,
    ])
    communityService.getOffendersByNomsNumbers.mockResolvedValue([
      {
        otherIds: { nomsNumber: 'AB1234E', crn: 'X12348' },
        offenderManagers: [{ active: true, staff: { forenames: 'Joe', surname: 'Bloggs', code: 'X1234' } }],
      } as OffenderDetail,
      {
        otherIds: { nomsNumber: 'AB1234F', crn: 'X12349' },
        offenderManagers: [{ active: true, staff: { forenames: 'Joe', surname: 'Bloggs', code: 'X1234' } }],
      } as OffenderDetail,
    ])
    licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([
      {
        nomisId: 'AB1234E',
        licenceId: 1,
        licenceType: LicenceType.AP,
        licenceStatus: LicenceStatus.APPROVED,
        comUsername: 'joebloggs',
      },
    ])

    const result = await serviceUnderTest.getOmuCaseload(user)

    expect(prisonerService.searchPrisonersByPrison).toHaveBeenNthCalledWith(1, 'p1', user)
    expect(prisonerService.searchPrisonersByPrison).toHaveBeenNthCalledWith(2, 'p2', user)
    expect(result).toMatchObject([
      {
        nomisRecord: {
          prisonerNumber: 'AB1234E',
          conditionalReleaseDate: '2022-06-20',
        },
        deliusRecord: {
          otherIds: {
            nomsNumber: 'AB1234E',
            crn: 'X12348',
          },
        },
        licences: [
          {
            id: 1,
            status: 'APPROVED',
            type: 'AP',
            comUsername: 'joebloggs',
          },
        ],
        probationPractitioner: {
          staffCode: 'X1234',
          name: 'Joe Bloggs',
        },
      },
      {
        nomisRecord: {
          prisonerNumber: 'AB1234F',
          conditionalReleaseDate: '2022-04-19',
        },
        deliusRecord: {
          otherIds: {
            nomsNumber: 'AB1234F',
            crn: 'X12349',
          },
        },
        licences: [
          {
            status: 'NOT_STARTED',
            type: 'AP',
          },
        ],
        probationPractitioner: {
          staffCode: 'X1234',
          name: 'Joe Bloggs',
        },
      },
    ])
  })

  it('builds the approver caseload', async () => {
    licenceService.getLicencesForApproval.mockResolvedValue([
      {
        nomisId: 'AB1234E',
        licenceId: 1,
        licenceType: LicenceType.AP,
        licenceStatus: LicenceStatus.SUBMITTED,
        comUsername: 'joebloggs',
      },
    ])
    communityService.getOffendersByNomsNumbers.mockResolvedValue([
      {
        otherIds: { nomsNumber: 'AB1234E', crn: 'X12348' },
        offenderManagers: [{ active: true, staff: { forenames: 'Joe', surname: 'Bloggs', code: 'X1234' } }],
      } as OffenderDetail,
    ])
    prisonerService.searchPrisonersByNomisIds.mockResolvedValue([
      { prisonerNumber: 'AB1234E', conditionalReleaseDate: '2022-06-20', status: 'ACTIVE IN' } as Prisoner,
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

    const result = await serviceUnderTest.getApproverCaseload(user)

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
          conditionalReleaseDate: '2022-06-20',
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

  it('builds the vary approver caseload', async () => {
    licenceService.getLicencesForVariationApproval.mockResolvedValue([
      {
        nomisId: 'AB1234E',
        licenceId: 1,
        licenceType: LicenceType.AP,
        licenceStatus: LicenceStatus.VARIATION_SUBMITTED,
        comUsername: 'joebloggs',
      },
    ])
    communityService.getOffendersByNomsNumbers.mockResolvedValue([
      {
        otherIds: { nomsNumber: 'AB1234E', crn: 'X12348' },
        offenderManagers: [{ active: true, staff: { forenames: 'Joe', surname: 'Bloggs', code: 'X1234' } }],
      } as OffenderDetail,
    ])
    prisonerService.searchPrisonersByNomisIds.mockResolvedValue([
      { prisonerNumber: 'AB1234E', conditionalReleaseDate: '2022-06-20', status: 'ACTIVE IN' } as Prisoner,
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
          conditionalReleaseDate: '2022-06-20',
        },
        licences: [
          {
            id: 1,
            type: 'AP',
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
