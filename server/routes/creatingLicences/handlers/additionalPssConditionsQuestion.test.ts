import { Request, Response } from 'express'

import AdditionalPssConditionsQuestionRoutes from './additionalPssConditionsQuestion'

describe('Route Handlers - Create Licence - Additional Pss Conditions Question', () => {
  const handler = new AdditionalPssConditionsQuestionRoutes()
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
      expect(res.render).toHaveBeenCalledWith('pages/create/additionalPssConditionsQuestion')
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
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/additional-pss-conditions')
    })

    it('should redirect to the bespoke conditions question page when answer is NO', async () => {
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
