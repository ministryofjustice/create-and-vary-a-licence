import { Request, Response } from 'express'

import BespokeConditionsQuestionRoutes from './bespokeConditionsQuestion'

describe('Route Handlers - Create Licence - Bespoke Conditions Question', () => {
  const handler = new BespokeConditionsQuestionRoutes()
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
      locals: {
        licence: {},
      },
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
          answer: 'Yes',
        },
      } as unknown as Request
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/bespoke-conditions')
    })

    it('should redirect to the check answers page when answer is NO and licence type is AP', async () => {
      res.locals.licence.typeCode = 'AP'

      req = {
        ...req,
        body: {
          answer: 'No',
        },
      } as unknown as Request
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/check-your-answers')
    })

    it('should redirect to the PSS conditions question page when answer is NO and licence type is PSS', async () => {
      res.locals.licence.typeCode = 'PSS'

      req = {
        ...req,
        body: {
          answer: 'No',
        },
      } as unknown as Request
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/additional-pss-conditions-question')
    })

    it('should redirect to the PSS conditions question page when answer is NO and licence type is AP_PSS', async () => {
      res.locals.licence.typeCode = 'AP_PSS'

      req = {
        ...req,
        body: {
          answer: 'No',
        },
      } as unknown as Request
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/additional-pss-conditions-question')
    })
  })
})
