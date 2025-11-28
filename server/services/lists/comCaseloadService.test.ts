import { addDays, format } from 'date-fns'
import LicenceService from '../licenceService'
import { User } from '../../@types/CvlUserDetails'
import { ComCreateCase, ComVaryCase } from '../../@types/licenceApiClientTypes'
import ComCaseloadService from './comCaseloadService'
import { convertDateFormat } from '../../utils/utils'
import { LicenceApiClient } from '../../data'

jest.mock('../prisonerService')
jest.mock('../probationService')

describe('COM Caseload Service', () => {
  const tenDaysFromNow = format(addDays(new Date(), 10), 'yyyy-MM-dd')
  const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>
  const licenceApiClient = new LicenceApiClient(null) as jest.Mocked<LicenceApiClient>
  const serviceUnderTest = new ComCaseloadService(licenceService, licenceApiClient)
  const user = {
    deliusStaffIdentifier: 2000,
    probationTeamCodes: ['teamA', 'teamB'],
    prisonCaseload: ['p1', 'p2'],
  } as User

  beforeEach(() => {
    licenceApiClient.getStaffCreateCaseload = jest.fn().mockResolvedValue([])
    licenceApiClient.getTeamCreateCaseload = jest.fn().mockResolvedValue([])
    licenceApiClient.getStaffVaryCaseload = jest.fn().mockResolvedValue([])
    licenceApiClient.getTeamVaryCaseload = jest.fn().mockResolvedValue([])
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('builds the staff create caseload', async () => {
    const comCaseload = [
      {
        crnNumber: 'X12348',
        prisonerNumber: 'AB1234E',
        releaseDate: convertDateFormat(tenDaysFromNow),
        licenceStatus: 'NOT_STARTED',
        licenceType: 'AP',
        probationPractitioner: {
          name: 'Joe Bloggs',
          staffCode: 'X1234',
        },
        isReviewNeeded: false,
      },
      {
        crnNumber: 'X12351',
        prisonerNumber: 'AB1234H',
        releaseDate: convertDateFormat(tenDaysFromNow),
        licenceStatus: 'NOT_STARTED',
        licenceType: 'PSS',
        isReviewNeeded: false,
      },
      {
        crnNumber: 'X12352',
        prisonerNumber: 'AB1234I',
        releaseDate: convertDateFormat(tenDaysFromNow),
        licenceId: 1,
        licenceStatus: 'SUBMITTED',
        licenceType: 'AP_PSS',
        probationPractitioner: {
          staffCode: 'X54321',
          name: 'Test Com',
        },
        isReviewNeeded: false,
      },
    ] as ComCreateCase[]

    licenceApiClient.getStaffCreateCaseload.mockResolvedValue(comCaseload)

    const result = await serviceUnderTest.getStaffCreateCaseload(user)
    expect(result).toStrictEqual(comCaseload)
  })

  it('builds the team create caseload', async () => {
    const comCaseload = [
      {
        crnNumber: 'X12348',
        prisonerNumber: 'AB1234E',
        releaseDate: convertDateFormat(tenDaysFromNow),
        licenceStatus: 'NOT_STARTED',
        licenceType: 'AP',
        probationPractitioner: {
          staffCode: 'X1234',
          name: 'Joe Bloggs',
        },
        isReviewNeeded: false,
      },
      {
        crnNumber: 'X12349',
        prisonerNumber: 'AB1234F',
        releaseDate: convertDateFormat(tenDaysFromNow),
        licenceStatus: 'NOT_STARTED',
        licenceType: 'PSS',
        probationPractitioner: {
          staffCode: 'X54321',
          name: 'Test Com',
        },
        isReviewNeeded: false,
      },
    ] as ComCreateCase[]

    licenceApiClient.getTeamCreateCaseload.mockResolvedValue(comCaseload)

    const result = await serviceUnderTest.getTeamCreateCaseload(user, ['teamA'])
    expect(result).toStrictEqual(comCaseload)
  })

  it('builds the staff vary caseload', async () => {
    const comCaseload = [
      {
        crnNumber: 'X12348',
        prisonerNumber: 'AB1234E',
        licenceId: 2,
        licenceStatus: 'VARIATION_IN_PROGRESS',
        licenceType: 'AP',
        probationPractitioner: {
          staffCode: 'X54321',
          name: 'Test Com',
        },
        isReviewNeeded: false,
      },
    ] as ComVaryCase[]

    licenceApiClient.getStaffVaryCaseload.mockResolvedValue(comCaseload)

    const result = await serviceUnderTest.getStaffVaryCaseload(user)
    expect(result).toStrictEqual(comCaseload)
  })

  it('builds the team vary caseload', async () => {
    const comCaseload = [
      {
        crnNumber: 'X12348',
        prisonerNumber: 'AB1234E',
        licenceId: 1,
        licenceStatus: 'VARIATION_IN_PROGRESS',
        licenceType: 'PSS',
        probationPractitioner: {
          staffCode: 'X1234',
          name: 'Joe Bloggs',
        },
        isReviewNeeded: false,
      },
      {
        crnNumber: 'X12349',
        prisonerNumber: 'AB1234F',
        licenceId: 2,
        licenceStatus: 'VARIATION_IN_PROGRESS',
        licenceType: 'AP',
        probationPractitioner: {
          staffCode: 'X54321',
          name: 'Test Com',
        },
        isReviewNeeded: false,
      },
    ] as ComVaryCase[]

    licenceApiClient.getTeamVaryCaseload.mockResolvedValue(comCaseload)

    const result = await serviceUnderTest.getTeamVaryCaseload(user, ['teamA'])

    expect(result).toStrictEqual(comCaseload)
  })
})
