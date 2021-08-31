import { Request, Response } from 'express'

import AdditionalConditionsQuestionRoutes from './additionalConditionsQuestion'

describe('Route Handlers - Create Licence - Additional Conditions Question', () => {
  const handler = new AdditionalConditionsQuestionRoutes()
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      params: {
        id: 1,
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
      expect(res.render).toHaveBeenCalledWith('pages/create/additionalConditionsQuestion', {
        offender: {
          name: 'Adam Balasaravika',
        },
      })
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
  })
})
