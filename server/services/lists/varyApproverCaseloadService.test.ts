import VaryApproverCaseloadService from './varyApproverCaseloadService'
import { User } from '../../@types/CvlUserDetails'
import { LicenceApiClient } from '../../data'

jest.mock('../../data')

describe('Vary Approver Caseload Service', () => {
  const licenceApiClient = new LicenceApiClient(null) as jest.Mocked<LicenceApiClient>
  const serviceUnderTest = new VaryApproverCaseloadService(licenceApiClient)
  const user = {
    deliusStaffIdentifier: 2000,
    probationTeamCodes: ['teamA', 'teamB'],
    prisonCaseload: ['p1', 'p2'],
  } as User

  afterEach(() => {
    jest.resetAllMocks()
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
        probationPractitioner: {
          staffCode: 'X1234',
          name: 'An ProbationOfficer',
          allocated: true,
        },
        isLao: false,
      },
    ])

    const result = await serviceUnderTest.getVaryApproverCaseload(user, undefined)

    expect(result).toMatchObject([
      {
        licenceId: 1,
        licenceType: 'AP',
        name: 'An Offender',
        probationPractitioner: {
          staffCode: 'X1234',
          name: 'An ProbationOfficer',
          allocated: true,
        },
        releaseDate: '01/11/2022',
        variationRequestDate: '30/10/2022',
      },
    ])
  })
})
