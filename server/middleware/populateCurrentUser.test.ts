import { Request, Response } from 'express'
import { Session } from 'express-session'
import populateCurrentUser from './populateCurrentUser'
import UserService from '../services/userService'
import { PrisonApiCaseload, PrisonApiUserDetail } from '../@types/prisonApiClientTypes'
import { AuthUserDetails, AuthUserEmail } from '../data/hmppsAuthClient'
import { CommunityApiStaffDetails } from '../@types/communityClientTypes'

jest.mock('../services/userService')

let res = {} as unknown as Response
let req = {} as Request
const next = jest.fn()

const userServiceMock = new UserService(null, null, null) as jest.Mocked<UserService>

const middleware = populateCurrentUser(userServiceMock)

beforeEach(() => {
  jest.resetAllMocks()

  res = {
    redirect: jest.fn(),
    locals: {
      user: {
        token: 'token',
      },
    },
  } as unknown as Response

  req = { session: {} } as Request
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
    })
    expect(next).toBeCalled()
  })

  it('should skip calling the user service and call next if no token is available', async () => {
    res.locals.user = {}

    await middleware(req, res, next)

    expect(userServiceMock.getPrisonUser).not.toHaveBeenCalled()
    expect(userServiceMock.getProbationUser).not.toHaveBeenCalled()
    expect(userServiceMock.getAuthUser).not.toHaveBeenCalled()
    expect(next).toBeCalled()
  })

  it('should catch error from user service and persist it to next', async () => {
    userServiceMock.getAuthUser.mockRejectedValue(new Error('Some error'))

    await middleware(req, res, next)

    expect(next).toBeCalledWith(new Error('Some error'))
  })

  it('should populate nomis user details', async () => {
    res.locals.user.authSource = 'nomis'

    userServiceMock.getPrisonUser.mockResolvedValue({
      firstName: 'Joe',
      lastName: 'Bloggs',
      activeCaseLoadId: '1',
      staffId: 3000,
    } as PrisonApiUserDetail)
    userServiceMock.getPrisonUserCaseloads.mockResolvedValue([
      {
        caseLoadId: 'MDI',
      },
      {
        caseLoadId: 'BMI',
      },
    ] as unknown as PrisonApiCaseload[])
    userServiceMock.getAuthUserEmail.mockResolvedValue({
      email: 'jbloggs@prison.gov.uk',
    } as AuthUserEmail)

    await middleware(req, res, next)

    expect(req.session.currentUser).toMatchObject({
      activeCaseload: '1',
      displayName: 'Joe Bloggs',
      emailAddress: 'jbloggs@prison.gov.uk',
      firstName: 'Joe',
      lastName: 'Bloggs',
      nomisStaffId: 3000,
      prisonCaseload: ['MDI', 'BMI'],
    })
    expect(next).toBeCalled()
  })

  it('should populate delius user details', async () => {
    res.locals.user.authSource = 'delius'

    userServiceMock.getProbationUser.mockResolvedValue({
      email: 'jbloggs@probation.gov.uk',
      teams: [
        {
          code: 'teamCode',
          localDeliveryUnit: {
            code: 'lduCode',
          },
        },
      ],
    } as CommunityApiStaffDetails)

    await middleware(req, res, next)

    expect(req.session.currentUser).toMatchObject({
      emailAddress: 'jbloggs@probation.gov.uk',
      probationTeams: ['teamCode'],
      probationLduCodes: ['lduCode'],
    })
    expect(userServiceMock.getAuthUserEmail).not.toHaveBeenCalled()
    expect(next).toBeCalled()
  })

  it('should populate auth user details', async () => {
    res.locals.user.authSource = 'auth'

    userServiceMock.getAuthUser.mockResolvedValue({
      name: 'Joe Bloggs',
    } as AuthUserDetails)
    userServiceMock.getAuthUserEmail.mockResolvedValue({
      email: 'jbloggs@prison.gov.uk',
    } as AuthUserEmail)

    await middleware(req, res, next)

    expect(req.session.currentUser).toMatchObject({
      displayName: 'Joe Bloggs',
      emailAddress: 'jbloggs@prison.gov.uk',
    })
    expect(next).toBeCalled()
  })

  it('should swallow error when calling authUserEmail', async () => {
    res.locals.user.authSource = 'auth'

    userServiceMock.getAuthUserEmail.mockRejectedValue({})

    await middleware(req, res, next)

    expect(next).toBeCalledWith()
  })
})
