import { Request, Response } from 'express'
import ProbationService from '../services/probationService'
import preLicenceCreationMiddleware from './preLicenceCreationMiddleware'
import { OffenderDetail } from '../@types/probationSearchApiClientTypes'
import { DeliusManager } from '../@types/deliusClientTypes'

jest.mock('../services/probationService')

let req: Request
let res: Response
const next = jest.fn()

const probationService = new ProbationService(null, null) as jest.Mocked<ProbationService>

const middleware = preLicenceCreationMiddleware(probationService)

beforeEach(() => {
  jest.resetAllMocks()
  req = {
    params: {
      nomisId: 'A1234BC',
    },
    path: '/licence/create/nomisId/A1234BC/confirm',
  } as unknown as Request

  res = {
    locals: {
      user: {
        username: 'YY',
        deliusStaffIdentifier: 123,
        probationAreaCode: 'N55',
        probationTeamCodes: ['Team2'],
        userRoles: ['ROLE_LICENCE_RO'],
      },
      licence: undefined,
    },
    redirect: jest.fn(),
  } as unknown as Response
})

describe('preLicenceCreationMiddleware', () => {
  it('should not run pre licence creation check if nomisId is not populated', async () => {
    req.params = {}
    await expect(middleware(req, res, next)).rejects.toThrow('No nomisId has been provided')
  })

  it('should return early if there is no delius staff identifier', async () => {
    probationService.getProbationer.mockResolvedValue(undefined)
    await middleware(req, res, next)
    expect(probationService.getProbationer).toHaveBeenCalledTimes(1)
    expect(probationService.getResponsibleCommunityManager).toHaveBeenCalledTimes(0)
    expect(res.redirect).toHaveBeenCalledWith('/authError')
  })

  it('should return early if there is no delius record', async () => {
    res.locals.user.deliusStaffIdentifier = undefined
    await middleware(req, res, next)
    expect(probationService.getProbationer).toHaveBeenCalledTimes(1)
    expect(probationService.getResponsibleCommunityManager).toHaveBeenCalledTimes(0)
    expect(res.redirect).toHaveBeenCalledWith('/authError')
  })

  it('should handle error from probation service', async () => {
    probationService.getProbationer.mockRejectedValue('Error')
    await middleware(req, res, next)
    expect(next).toHaveBeenCalledWith('Error')
  })

  it('should allow access for a probation user based on teams', async () => {
    probationService.getProbationer.mockResolvedValue({
      otherIds: {
        crn: 'X12345',
      },
    } as OffenderDetail)
    probationService.getResponsibleCommunityManager.mockResolvedValue({
      code: 'X12345',
      id: 2000,
      username: 'joebloggs',
      email: 'joebloggs@probation.gov.uk',
      name: {
        forename: 'Joe',
        surname: 'Bloggs',
      },
      provider: {
        code: 'N02',
        description: 'N02 Region',
      },
      team: {
        code: 'Team2',
        description: 'Team2 Description',
        borough: {
          code: 'PDU2',
          description: 'PDU2 Description',
        },
        district: {
          code: 'LAU2',
          description: 'LAU2 Description',
        },
      },
    } as DeliusManager)
    await middleware(req, res, next)
    expect(probationService.getProbationer).toHaveBeenCalledTimes(1)
    expect(probationService.getResponsibleCommunityManager).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledTimes(1)
  })

  it('should deny access for a probation user based on teams', async () => {
    probationService.getProbationer.mockResolvedValue({
      otherIds: {
        crn: 'X12345',
      },
    } as OffenderDetail)
    probationService.getResponsibleCommunityManager.mockResolvedValue({
      code: 'X12345',
      id: 2000,
      username: 'joebloggs',
      email: 'joebloggs@probation.gov.uk',
      name: {
        forename: 'Joe',
        surname: 'Bloggs',
      },
      provider: {
        code: 'N02',
        description: 'N02 Region',
      },
      team: {
        code: 'Team3',
        description: 'Team3 Description',
        borough: {
          code: 'PDU2',
          description: 'PDU2 Description',
        },
        district: {
          code: 'LAU2',
          description: 'LAU2 Description',
        },
      },
    } as DeliusManager)
    await middleware(req, res, next)
    expect(probationService.getProbationer).toHaveBeenCalledTimes(1)
    expect(probationService.getResponsibleCommunityManager).toHaveBeenCalledTimes(1)
    expect(res.redirect).toHaveBeenCalledWith('/access-denied')
    expect(next).not.toHaveBeenCalled()
  })
})
