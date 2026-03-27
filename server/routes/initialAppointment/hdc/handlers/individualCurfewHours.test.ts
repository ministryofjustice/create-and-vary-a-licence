import { Request, Response } from 'express'
import { HdcLicence } from '../../../../@types/licenceApiClientTypes'
import { DAYS } from '../../../../enumeration/days'
import HdcService from '../../../../services/hdcService'
import IndividualCurfewHoursRoutes from './individualCurfewHours'
import DailyCurfewTime from '../types/dailyCurfewTime'

const hdcService = new HdcService(null) as jest.Mocked<HdcService>
jest.mock('../../../../services/hdcService')

describe('IndividualCurfewHoursRoutes', () => {
  let req: Request
  let res: Response
  const licence = {
    id: 1,
    kind: 'HDC',
    eligibleKind: 'HDC',
    isInHardStopPeriod: false,
    isDueToBeReleasedInTheNextTwoWorkingDays: false,
    weeklyCurfewTimes: [
      {
        fromTime: '20:00:00',
        fromDay: 'MONDAY',
        untilTime: '06:00:00',
        untilDay: 'TUESDAY',
        curfewTimesSequence: 0,
      },
    ],
  } as HdcLicence

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
        licence,
      },
    } as unknown as Response
  })

  const handler = new IndividualCurfewHoursRoutes(hdcService)

  const curfewTimesDisplayObject = {
    0: {
      fromTime: { hour: '08', minute: '00', ampm: 'pm' },
      fromDay: 'MONDAY',
      untilTime: { hour: '06', minute: '00', ampm: 'am' },
      untilDay: 'TUESDAY',
      sequence: 0,
    } as DailyCurfewTime,
  }

  hdcService.getCurfewTimes.mockReturnValue(curfewTimesDisplayObject)

  describe('GET', () => {
    it('should render view with form responses', async () => {
      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/hdc/individualCurfewHours', {
        days: DAYS,
        curfewTimes: curfewTimesDisplayObject,
      })
    })
  })

  describe('POST', () => {
    it('should update curfew times and redirect', async () => {
      req.body = {
        curfews: [
          {
            fromTime: { hour: '08', minute: '00', ampm: 'pm' },
            fromDay: 'MONDAY',
            untilTime: { hour: '06', minute: '00', ampm: 'am' },
            untilDay: 'TUESDAY',
            sequence: 0,
          },
        ],
      }

      await handler.POST(req, res)

      expect(hdcService.updateDifferingCurfewTimes).toHaveBeenCalledWith(
        1,
        [
          {
            fromTime: { hour: '08', minute: '00', ampm: 'pm' },
            fromDay: 'MONDAY',
            untilTime: { hour: '06', minute: '00', ampm: 'am' },
            untilDay: 'TUESDAY',
            sequence: 0,
          },
        ],
        res.locals.user,
      )

      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/additional-licence-conditions-question')
    })
  })
})
