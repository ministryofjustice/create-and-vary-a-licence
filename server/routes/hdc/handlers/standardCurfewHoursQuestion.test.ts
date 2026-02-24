import { Request, Response } from 'express'
import StandardCurfewHoursQuestionRoutes from './standardCurfewHoursQuestion'
import YesOrNo from '../../../enumeration/yesOrNo'
import LicenceService from '../../../services/licenceService'
import { getStandardHdcCurfewTimes } from '../../../utils/utils'

const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>
jest.mock('../../../services/licenceService')

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

  const handler = new StandardCurfewHoursQuestionRoutes(licenceService)

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
      const standardCurfewTimes = getStandardHdcCurfewTimes()
      expect(licenceService.updateCurfewTimes).toHaveBeenCalledWith(1, standardCurfewTimes, res.locals.user)
    })
  })
})
