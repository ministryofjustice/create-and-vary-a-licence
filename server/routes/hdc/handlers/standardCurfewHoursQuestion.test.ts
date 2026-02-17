import fs from 'fs'
import { Request, Response } from 'express'
import { templateRenderer } from '../../../utils/__testutils/templateTestUtils'
import StandardCurfewHoursQuestionRoutes from './standardCurfewHoursQuestion'
import YesOrNo from '../../../enumeration/yesOrNo'

describe('Route Handlers - Create Licence - Do HDC Curfew Hours Apply Daily', () => {
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
        licence: {},
      },
    } as unknown as Response
  })

  const handler = new StandardCurfewHoursQuestionRoutes()

  describe('GET', () => {
    it('should render view', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/hdc/standardCurfewHoursQuestion')
    })
  })

  describe('POST', () => {
    it('when the answer is no, it should redirect to the do hdc curfew hours apply daily page', async () => {
      req.body = {answer: YesOrNo.NO}
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/do-hdc-curfew-hours-apply-daily')
    })

    it('when the answer is yes, it should redirect to the additional licence conditions question page', async () => {
      req.body = {answer: YesOrNo.YES}
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/additional-licence-conditions-question')
    })
  })
})
