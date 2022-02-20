import { Request, Response } from 'express'

import LicenceService from '../../../services/licenceService'
import VloDiscussionRoutes from './vloDiscussion'

const licenceService = new LicenceService(null, null, null) as jest.Mocked<LicenceService>
jest.mock('../../../services/licenceService')

describe('Route Handlers - Vary Licence - Vlo discussion', () => {
  const handler = new VloDiscussionRoutes(licenceService)
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      params: {
        licenceId: 1,
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
      expect(res.render).toHaveBeenCalledWith('pages/vary/vloDiscussion')
    })
  })

  describe('POST', () => {
    it('should save response and redirect to the check your answers page', async () => {
      req.body = { answer: 'Yes' }
      await handler.POST(req, res)

      expect(licenceService.updateVloDiscussion).toHaveBeenCalledWith(
        1,
        { vloDiscussion: 'Yes' },
        { username: 'joebloggs' }
      )
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/check-your-answers')
    })
  })
})
