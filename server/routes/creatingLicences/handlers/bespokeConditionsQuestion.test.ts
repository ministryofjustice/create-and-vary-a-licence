import { Request, Response } from 'express'

import BespokeConditionsQuestionRoutes from './bespokeConditionsQuestion'
import LicenceService from '../../../services/licenceService'
import BespokeConditions from '../types/bespokeConditions'

const licenceService = new LicenceService(null, null, null) as jest.Mocked<LicenceService>

jest.mock('../../../services/licenceService')

describe('Route Handlers - Create Licence - Bespoke Conditions Question', () => {
  const handler = new BespokeConditionsQuestionRoutes(licenceService)
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      params: {
        licenceId: '1',
      },
      user: {
        username: 'joebloggs',
      },
    } as unknown as Request

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
    } as unknown as Response
  })

  describe('GET', () => {
    it('should render view', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/bespokeConditionsQuestion')
    })
  })

  describe('POST', () => {
    it('should redirect to the bespoke conditions page when answer is YES', async () => {
      req = {
        ...req,
        body: {
          answer: 'yes',
        },
      } as unknown as Request
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/bespoke-conditions')
    })

    it('should redirect to the bespoke conditions page with fromReviewFlag when answer is YES', async () => {
      req = {
        ...req,
        body: {
          answer: 'yes',
        },
        query: {
          fromReview: 'true',
        },
      } as unknown as Request
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/bespoke-conditions?fromReview=true')
    })

    it('should clear any existing bespoke conditions on the licence when the answer is NO', async () => {
      req = {
        ...req,
        body: {
          answer: 'no',
        },
      } as unknown as Request
      await handler.POST(req, res)
      expect(licenceService.updateBespokeConditions).toHaveBeenCalledWith(
        '1',
        { conditions: [] } as BespokeConditions,
        'joebloggs'
      )
    })

    it('should redirect to the check answers page when answer is NO', async () => {
      req = {
        ...req,
        body: {
          answer: 'no',
        },
      } as unknown as Request
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/check-your-answers')
    })
  })
})
