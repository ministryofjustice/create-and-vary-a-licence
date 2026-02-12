import { Request, Response } from 'express'
import { Session } from 'express-session'
import { addDays, format, subDays } from 'date-fns'
import populateCurrentUser from './populateCurrentUser'
import UserService from '../services/userService'
import { PrisonApiCaseload, PrisonApiUserDetail } from '../@types/prisonApiClientTypes'
import { UserDetails, UserEmail } from '../data/manageUsersApiClient'
import { DeliusStaff } from '../@types/deliusClientTypes'
import LicenceService from '../services/licenceService'
import { User } from '../@types/CvlUserDetails'
import AuthRole from '../enumeration/authRole'

jest.mock('../services/userService')
jest.mock('../services/licenceService')

let res = {} as unknown as Response
let req = {} as Request
const next = jest.fn()

const userServiceMock = new UserService(null, null, null) as jest.Mocked<UserService>
const licenceServiceMock = new LicenceService(null, null) as jest.Mocked<LicenceService>

const middleware = populateCurrentUser(userServiceMock, licenceServiceMock)

beforeEach(() => {
  jest.resetAllMocks()

  res = {
    redirect: jest.fn(),
    locals: {
      user: {
        token: 'token',
        username: 'joebloggs',
      },
    },
  } as unknown as Response

  req = { session: {}, user: { userRoles: [] } } as Request
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('populateCurrentUser', () => {
  it('should add current user to res locals if it already exists in session', async () => {
    req.session = {
      currentUser: {
        displayName: 'Joe Bloggs',
      },
    } as unknown as Session
    await middleware(req, res, next)

    expect(res.locals.user).toEqual({
      token: 'token',
      displayName: 'Joe Bloggs',
      username: 'joebloggs',
    })
    expect(next).toHaveBeenCalled()
  })

  it('should skip calling the user service and call next if no token is available', async () => {
    res.locals.user = {} as User

    await middleware(req, res, next)

    expect(userServiceMock.getPrisonUser).not.toHaveBeenCalled()
    expect(userServiceMock.getProbationUser).not.toHaveBeenCalled()
    expect(userServiceMock.getUser).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })

  // Causes an error to appear in the console with message 'Failed to get user details for: joebloggs' (expected)
  it('should catch error from user service and persist it to next', async () => {
    userServiceMock.getUser.mockRejectedValue(new Error('Some error'))

    await middleware(req, res, next)

    expect(next).toHaveBeenCalledWith(new Error('Some error'))
  })

  it('should populate nomis user details', async () => {
    res.locals.user.authSource = 'nomis'
    req.user.userRoles = [AuthRole.CASE_ADMIN]

    userServiceMock.getPrisonUser.mockResolvedValue({
      firstName: 'Joe',
      lastName: 'Bloggs',
      username: 'joebloggs',
      activeCaseLoadId: 'MDI',
      staffId: 3000,
    } as PrisonApiUserDetail)

    userServiceMock.getUserEmail.mockResolvedValue({
      username: 'joebloggs',
      email: 'jbloggs@prison.gov.uk',
      verified: true,
    } as UserEmail)

    userServiceMock.getPrisonUserCaseloads.mockResolvedValue([
      {
        caseLoadId: 'MDI',
      },
      {
        caseLoadId: 'BMI',
      },
    ] as unknown as PrisonApiCaseload[])

    await middleware(req, res, next)

    expect(req.session.currentUser).toMatchObject({
      activeCaseload: 'MDI',
      displayName: 'Joe Bloggs',
      firstName: 'Joe',
      lastName: 'Bloggs',
      nomisStaffId: 3000,
      prisonCaseload: ['MDI', 'BMI'],
      hasMultipleCaseloadsInNomis: true,
      hasSelectedMultiplePrisonCaseloads: false,
      prisonCaseloadToDisplay: ['MDI'],
    })
    expect(licenceServiceMock.updatePrisonUserDetails).toHaveBeenCalledWith({
      staffUsername: 'joebloggs',
      staffEmail: 'jbloggs@prison.gov.uk',
      firstName: 'Joe',
      lastName: 'Bloggs',
    })
    expect(next).toHaveBeenCalled()
  })

  it('should populate nomis user details', async () => {
    res.locals.user.authSource = 'nomis'
    req.user.userRoles = [AuthRole.DECISION_MAKER]

    userServiceMock.getPrisonUser.mockResolvedValue({
      firstName: 'Joe',
      lastName: 'Bloggs',
      username: 'joebloggs',
      activeCaseLoadId: 'MDI',
      staffId: 3000,
    } as PrisonApiUserDetail)

    userServiceMock.getUserEmail.mockResolvedValue({
      username: 'joebloggs',
      email: 'jbloggs@prison.gov.uk',
      verified: true,
    } as UserEmail)

    userServiceMock.getPrisonUserCaseloads.mockResolvedValue([
      {
        caseLoadId: 'MDI',
      },
      {
        caseLoadId: 'BMI',
      },
    ] as unknown as PrisonApiCaseload[])

    await middleware(req, res, next)

    expect(req.session.currentUser).toMatchObject({
      activeCaseload: 'MDI',
      displayName: 'Joe Bloggs',
      firstName: 'Joe',
      lastName: 'Bloggs',
      nomisStaffId: 3000,
      prisonCaseload: ['MDI', 'BMI'],
      hasMultipleCaseloadsInNomis: true,
      hasSelectedMultiplePrisonCaseloads: false,
      prisonCaseloadToDisplay: ['MDI'],
      reportUserId: '3000',
    })
    expect(licenceServiceMock.updatePrisonUserDetails).toHaveBeenCalledWith({
      staffUsername: 'joebloggs',
      staffEmail: 'jbloggs@prison.gov.uk',
      firstName: 'Joe',
      lastName: 'Bloggs',
    })
    expect(next).toHaveBeenCalled()
  })

  it('should call updatePrisonUserDetails when email of a nomis user is not found or is unverified', async () => {
    res.locals.user.authSource = 'nomis'
    req.user.userRoles = [AuthRole.CASE_ADMIN]

    userServiceMock.getPrisonUser.mockResolvedValue({
      firstName: 'Joe',
      lastName: 'Bloggs',
      username: 'joebloggs',
      activeCaseLoadId: 'MDI',
      staffId: 3000,
    } as PrisonApiUserDetail)

    userServiceMock.getUserEmail.mockResolvedValue({
      username: 'joebloggs',
      verified: true,
    } as UserEmail)

    userServiceMock.getPrisonUserCaseloads.mockResolvedValue([
      {
        caseLoadId: 'MDI',
      },
      {
        caseLoadId: 'BMI',
      },
    ] as unknown as PrisonApiCaseload[])

    await middleware(req, res, next)

    expect(licenceServiceMock.updatePrisonUserDetails).toHaveBeenCalledWith({
      staffUsername: 'joebloggs',
      staffEmail: undefined,
      firstName: 'Joe',
      lastName: 'Bloggs',
    })
    expect(next).toHaveBeenCalled()
  })

  it('should populate delius user details', async () => {
    res.locals.user.authSource = 'delius'

    userServiceMock.getProbationUser.mockResolvedValue({
      id: 2000,
      code: 'ABC',
      email: 'jbloggs@probation.gov.uk',
      provider: {
        code: 'areaCode',
        description: 'areaDesc',
      },
      name: {
        forename: 'Joseph',
        surname: 'Bloggs',
      },
      teams: [
        {
          code: 'teamCode-1',
          district: {
            code: 'lauCode',
          },
          borough: {
            code: 'pduCode',
          },
          endDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
        },
        {
          code: 'teamCode-2',
          district: {
            code: 'lauCode',
          },
          borough: {
            code: 'pduCode',
          },
          endDate: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
        },
        {
          code: 'teamCode-3',
          district: {
            code: 'lauCode',
          },
          borough: {
            code: 'pduCode',
          },
          endDate: format(new Date(), 'yyyy-MM-dd'),
        },
        {
          code: 'teamCode-4',
          district: {
            code: 'lauCode',
          },
          borough: {
            code: 'pduCode',
          },
          endDate: undefined,
        },
      ],
    } as DeliusStaff)

    await middleware(req, res, next)

    expect(req.session.currentUser).toMatchObject({
      emailAddress: 'jbloggs@probation.gov.uk',
      probationAreaCode: 'areaCode',
      probationAreaDescription: 'areaDesc',
      probationPduCodes: ['pduCode'],
      probationLauCodes: ['lauCode'],
      probationTeamCodes: ['teamCode-1', 'teamCode-4'],
    })
    expect(licenceServiceMock.updateComDetails).toHaveBeenCalledWith({
      staffIdentifier: 2000,
      staffCode: 'ABC',
      staffUsername: 'joebloggs',
      staffEmail: 'jbloggs@probation.gov.uk',
      firstName: 'Joseph',
      lastName: 'Bloggs',
    })
    expect(userServiceMock.getUserEmail).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })

  it('should populate auth user details', async () => {
    res.locals.user.authSource = 'auth'

    userServiceMock.getUser.mockResolvedValue({
      name: 'Joe Bloggs',
      userId: 'some-id',
    } as UserDetails)
    userServiceMock.getUserEmail.mockResolvedValue({
      email: 'jbloggs@prison.gov.uk',
    } as UserEmail)

    await middleware(req, res, next)

    expect(req.session.currentUser).toMatchObject({
      displayName: 'Joe Bloggs',
      emailAddress: 'jbloggs@prison.gov.uk',
      reportUserId: 'some-id',
    })
    expect(next).toHaveBeenCalled()
  })

  it('should swallow error when calling getUserEmail', async () => {
    res.locals.user.authSource = 'auth'

    userServiceMock.getUserEmail.mockRejectedValue({})

    await middleware(req, res, next)

    expect(next).toHaveBeenCalledWith()
  })
})
