import { Request, Response } from 'express'

import LicenceService from '../../../services/licenceService'
import { LicenceSummary } from '../../../@types/licenceApiClientTypes'
import ConfirmVaryActionRoutes from './confirmVaryAction'

const licenceService = new LicenceService(null, null, null) as jest.Mocked<LicenceService>
jest.mock('../../../services/licenceService')

describe('Route Handlers - Vary Licence - Confirm vary', () => {
  const handler = new ConfirmVaryActionRoutes(licenceService)
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      params: {
        licenceId: '1',
      },
      body: {},
      query: {},
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

  describe('GET', () => {
    it('should render view', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/vary/confirmVaryQuestion')
    })
  })

  describe('POST', () => {
    it('should redirect to view variation if answer is no', async () => {
      req.body = { answer: 'No' }
      await handler.POST(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/licence/vary/id/1/view')
    })

    it('should create licence variation when answer is yes', async () => {
      licenceService.createVariation.mockResolvedValue({ licenceId: 2 } as LicenceSummary)

      req.body = { answer: 'Yes' }
      await handler.POST(req, res)

      expect(licenceService.createVariation).toHaveBeenCalledWith('1', { username: 'joebloggs' })
      expect(res.redirect).toHaveBeenCalledWith('/licence/vary/id/2/spo-discussion')
    })
  })
})
