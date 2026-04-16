import { Request, Response } from 'express'
import HdcService from '../../../../services/hdcService'
import { STANDARD_FIRST_NIGHT_CURFEW_TIMES } from '../curfewDefaults'
import FirstNightCurfewTimesRoutes from './firstNightCurfewTimes'
import { json24HourTimeTo12HourTime } from '../../../../utils/utils'
import { SimpleTime } from '../../../manageConditions/types'

const hdcService = new HdcService(null) as jest.Mocked<HdcService>
jest.mock('../../../../services/hdcService')

describe('Route Handlers - Create Licence - First Night Curfew Times', () => {
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

  const handler = new FirstNightCurfewTimesRoutes(hdcService)

  describe('GET', () => {
    it('should render view with default first night curfew times', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/hdc/firstNightCurfewTimes', {
        firstNightCurfewTimes: {
          curfewStart: STANDARD_FIRST_NIGHT_CURFEW_TIMES.curfewStart,
          curfewEnd: STANDARD_FIRST_NIGHT_CURFEW_TIMES.curfewEnd,
        },
      })
    })

    it('should render view with curfew times from licence when they exist', async () => {
      const licence = {
        id: 1,
        firstNightCurfewTimes: {
          fromTime: '21:00',
          untilTime: '07:00',
        },
      }
      res.locals.licence = licence

      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/hdc/firstNightCurfewTimes', {
        firstNightCurfewTimes: {
          curfewStart: SimpleTime.fromString(json24HourTimeTo12HourTime(licence.firstNightCurfewTimes.fromTime)),
          curfewEnd: SimpleTime.fromString(json24HourTimeTo12HourTime(licence.firstNightCurfewTimes.untilTime)),
        },
      })
    })
  })

  describe('POST', () => {
    it('should redirect to the standard curfew question page', async () => {
      req.body = { curfewStart: SimpleTime.fromString('07:00 pm'), curfewEnd: SimpleTime.fromString('07:00 am') }
      await handler.POST(req, res)
      expect(hdcService.updateFirstNightCurfewTimes).toHaveBeenCalledWith(
        1,
        {
          firstNightCurfewTimes: {
            fromTime: '19:00:00',
            untilTime: '07:00:00',
          },
        },
        res.locals.user,
      )
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/hdc/standard-curfew-hours-question')
    })

    it('should redirect to the check your answers page if fromReview query param is present', async () => {
      req.query = { fromReview: 'true' }
      req.body = { curfewStart: SimpleTime.fromString('07:00 pm'), curfewEnd: SimpleTime.fromString('07:00 am') }
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/check-your-answers')
    })
  })
})
