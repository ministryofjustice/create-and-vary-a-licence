import { Request, Response } from 'express'
import StandardCurfewHoursQuestionRoutes from './standardCurfewHoursQuestion'
import YesOrNo from '../../../../enumeration/yesOrNo'
import HdcService from '../../../../services/hdcService'
import STANDARD_CURFEW_TIMES from '../curfewDefaults'

const hdcService = new HdcService(null) as jest.Mocked<HdcService>
jest.mock('../../../../services/hdcService')

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
        licence: {
          id: 1,
        },
      },
    } as unknown as Response
  })

  const handler = new StandardCurfewHoursQuestionRoutes(hdcService)

  describe('GET', () => {
    it('should render view', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/hdc/standardCurfewHoursQuestion')
    })
  })

  describe('POST', () => {
    it('when the answer is no, it should redirect to the do hdc curfew hours apply daily page', async () => {
      req.body = { answer: YesOrNo.NO }
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/hdc/do-hdc-curfew-hours-apply-daily')
    })

    it('when the answer is yes, it should redirect to the additional licence conditions question page', async () => {
      req.body = { answer: YesOrNo.YES }
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/additional-licence-conditions-question')
    })

    it('when the answer is yes, it should send the standard curfew times to the licence API', async () => {
      req.body = { answer: YesOrNo.YES }
      await handler.POST(req, res)
      expect(hdcService.updateCurfewTimes).toHaveBeenCalledWith(1, STANDARD_CURFEW_TIMES, res.locals.user)
    })
  })
})
