import { Request, Response } from 'express'

import LicenceService from '../../../services/licenceService'
import ReasonForVariationRoutes from './reasonForVariation'

const licenceService = new LicenceService(null, null, null) as jest.Mocked<LicenceService>
jest.mock('../../../services/licenceService')

describe('Route Handlers - Vary Licence - Reason for variation', () => {
  const handler = new ReasonForVariationRoutes(licenceService)
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
      expect(res.render).toHaveBeenCalledWith('pages/vary/reasonForVariation')
    })
  })

  describe('POST', () => {
    it('should update reason for variation', async () => {
      req.body = { reasonForVariation: 'Reason' }
      await handler.POST(req, res)

      expect(licenceService.updateReasonForVariation).toHaveBeenCalledWith(
        '1',
        { reasonForVariation: 'Reason' },
        { username: 'joebloggs' }
      )
      expect(res.redirect).toHaveBeenCalledWith('/licence/vary/id/1/summary')
    })
  })
})
