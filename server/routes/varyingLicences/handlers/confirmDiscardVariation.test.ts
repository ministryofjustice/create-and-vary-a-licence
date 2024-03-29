import { Request, Response } from 'express'

import LicenceService from '../../../services/licenceService'
import ConfirmDiscardVariationRoutes from './confirmDiscardVariation'

const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>
jest.mock('../../../services/licenceService')

describe('Route Handlers - Vary Licence - Confirm discard variation', () => {
  const handler = new ConfirmDiscardVariationRoutes(licenceService)
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      params: {
        licenceId: '1',
      },
      body: {},
      query: {},
      session: {
        returnToCase: '/licence/vary/caseload',
      },
    } as unknown as Request

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
      locals: {
        user: {
          username: 'joebloggs',
        },
      },
    } as unknown as Response
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('GET', () => {
    it('should render view', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/vary/confirmDiscardVariation')
    })
  })

  describe('POST', () => {
    it('should discard licence when answer is yes', async () => {
      req.body = { answer: 'Yes' }
      await handler.POST(req, res)

      expect(licenceService.discard).toHaveBeenCalledWith('1', { username: 'joebloggs' })
      expect(res.redirect).toHaveBeenCalledWith(req.session.returnToCase)
    })

    it('should redirect to view variation when answer is no', async () => {
      req.body = { answer: 'No' }
      await handler.POST(req, res)

      expect(licenceService.discard).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/licence/vary/id/1/view')
    })

    it('should redirect to default if no session state', async () => {
      const reqWithEmptySession = {
        params: {
          licenceId: '1',
        },
        body: { answer: 'Yes' },
        session: {},
        flash: jest.fn(),
      } as unknown as Request

      await handler.POST(reqWithEmptySession, res)

      expect(res.redirect).toHaveBeenCalledWith('/licence/vary/caseload')
    })
  })
})
