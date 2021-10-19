import { Request, Response } from 'express'

import AdditionalConditionsQuestionRoutes from './additionalConditionsQuestion'

import LicenceService from '../../../services/licenceService'

const licenceService = new LicenceService(null, null, null) as jest.Mocked<LicenceService>

describe('Route Handlers - Create Licence - Additional Conditions Question', () => {
  const handler = new AdditionalConditionsQuestionRoutes(licenceService)
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      params: {
        licenceId: 1,
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
      expect(res.render).toHaveBeenCalledWith('pages/create/additionalConditionsQuestion')
    })
  })

  describe('POST', () => {
    it('should redirect to the additional conditions page when answer is YES', async () => {
      req = {
        ...req,
        body: {
          answer: 'yes',
        },
      } as unknown as Request
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/additional-conditions')
    })

    it('should redirect to the additional conditions page with fromReview flag', async () => {
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
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/additional-conditions?fromReview=true')
    })

    it('should redirect to the bespoke conditions question page when answer is NO', async () => {
      req = {
        ...req,
        body: {
          answer: 'no',
        },
      } as unknown as Request
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/bespoke-conditions-question')
    })

    it('should redirect to check your answers page when answer is NO and fromReview flag is true', async () => {
      req = {
        ...req,
        body: {
          answer: 'no',
        },
        query: {
          fromReview: 'true',
        },
      } as unknown as Request
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/check-your-answers')
    })
  })
})
