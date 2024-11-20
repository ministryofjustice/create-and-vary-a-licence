import { Request, Response } from 'express'

import LicenceService from '../../../services/licenceService'
import SpoDiscussionRoutes from './spoDiscussion'

const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>
jest.mock('../../../services/licenceService')

describe('Route Handlers - Vary Licence - Spo discussion', () => {
  const handler = new SpoDiscussionRoutes(licenceService)
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
      expect(res.render).toHaveBeenCalledWith('pages/vary/spoDiscussion')
    })
  })

  describe('POST', () => {
    it('should save response and redirect to the vlo discussion page', async () => {
      req.body = { answer: 'Yes' }
      await handler.POST(req, res)

      expect(licenceService.updateSpoDiscussion).toHaveBeenCalledWith(
        1,
        { spoDiscussion: 'Yes' },
        { username: 'joebloggs' },
      )
      expect(res.redirect).toHaveBeenCalledWith('/licence/vary/id/1/vlo-discussion')
    })

    it('should redirect to the check your answers page if fromReview flag is set', async () => {
      req.body = 'No'
      req.query.fromReview = 'true'
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/check-your-answers')
    })
  })
})
