import { Request, Response } from 'express'
import ProbationService from '../services/probationService'
import preLicenceCreationMiddleware from './preLicenceCreationMiddleware'
import { OffenderDetail } from '../@types/probationSearchApiClientTypes'
import { DeliusManager } from '../@types/deliusClientTypes'

jest.mock('../services/probationService')

const req = {
  path: '/licence/create/nomisId/A1234BC/confirm',
} as Request
const next = jest.fn()

const res = {
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

const probationService = new ProbationService(null, null) as jest.Mocked<ProbationService>

const middleware = preLicenceCreationMiddleware(probationService)

beforeEach(() => {
  req.params = { nomisId: 'A1234BC' }
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('preLicenceCreationMiddleware', () => {
  it('should not run pre licence creation check if nomisId is not populated', async () => {
    req.params = {}
    await middleware(req, res, next)
    expect(probationService.getProbationer).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledTimes(1)
  })

  it('should populate delius record from probation service', async () => {
    await middleware(req, res, next)
    expect(probationService.getProbationer).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledTimes(1)
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
