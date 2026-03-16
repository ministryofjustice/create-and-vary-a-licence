import { Request, Response } from 'express'
import { CurfewTimes, HdcLicence } from '../../../../@types/licenceApiClientTypes'
import { DAYS } from '../../../../enumeration/days'
import HdcService from '../../../../services/hdcService'
import IndividualCurfewHoursRoutes from './individualCurfewHours'

const hdcService = new HdcService(null) as jest.Mocked<HdcService>
jest.mock('../../../services/hdcService')

describe('IndividualCurfewHoursRoutes', () => {
  let req: Request
  let res: Response
  const licence = {
    id: 1,
    kind: 'HDC',
    eligibleKind: 'HDC',
    isInHardStopPeriod: false,
    isDueToBeReleasedInTheNextTwoWorkingDays: false,
    curfewTimes: [
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

  describe('GET', () => {
    it('should render view with form responses', async () => {
      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/hdc/individualCurfewHours', {
        days: DAYS,
        curfewTimes: {
          0: {
            fromTime: { hour: '08', minute: '00', ampm: 'pm' },
            fromDay: 'MONDAY',
            untilTime: { hour: '06', minute: '00', ampm: 'am' },
            untilDay: 'TUESDAY',
            sequence: 0,
          },
        },
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

  describe('buildCurfewTimes', () => {
    it('should build form response object from curfew times', () => {
      const curfewTimes = [
        {
          fromTime: '20:00:00',
          fromDay: 'MONDAY',
          untilTime: '06:00:00',
          untilDay: 'TUESDAY',
          curfewTimesSequence: 0,
        },
        {
          fromTime: '22:00:00',
          fromDay: 'TUESDAY',
          untilTime: '08:00:00',
          untilDay: 'WEDNESDAY',
          curfewTimesSequence: 1,
        },
        {
          fromTime: '10:00:00',
          fromDay: 'THURSDAY',
          untilTime: '18:00:00',
          untilDay: 'THURSDAY',
          curfewTimesSequence: 2,
        },
      ] as CurfewTimes[]

      const formResponseObject = handler.buildCurfewTimes(curfewTimes)
      expect(formResponseObject).toEqual({
        0: {
          fromTime: { hour: '08', minute: '00', ampm: 'pm' },
          fromDay: 'MONDAY',
          untilTime: { hour: '06', minute: '00', ampm: 'am' },
          untilDay: 'TUESDAY',
          sequence: 0,
        },
        1: {
          fromTime: { hour: '10', minute: '00', ampm: 'pm' },
          fromDay: 'TUESDAY',
          untilTime: { hour: '08', minute: '00', ampm: 'am' },
          untilDay: 'WEDNESDAY',
          sequence: 1,
        },
        2: {
          fromTime: { hour: '10', minute: '00', ampm: 'am' },
          fromDay: 'THURSDAY',
          untilTime: { hour: '06', minute: '00', ampm: 'pm' },
          untilDay: 'THURSDAY',
          sequence: 2,
        },
      })
    })
  })

  describe('buildStandardCurfewHours', () => {
    it('should build form response object from curfew times', () => {
      expect(handler.buildStandardCurfewTimes()).toEqual({
        0: {
          fromTime: { hour: '07', minute: '00', ampm: 'pm' },
          fromDay: 'MONDAY',
          untilTime: { hour: '07', minute: '00', ampm: 'am' },
          untilDay: 'TUESDAY',
          sequence: 0,
        },
        1: {
          fromTime: { hour: '07', minute: '00', ampm: 'pm' },
          fromDay: 'TUESDAY',
          untilTime: { hour: '07', minute: '00', ampm: 'am' },
          untilDay: 'WEDNESDAY',
          sequence: 1,
        },
        2: {
          fromTime: { hour: '07', minute: '00', ampm: 'pm' },
          fromDay: 'WEDNESDAY',
          untilTime: { hour: '07', minute: '00', ampm: 'am' },
          untilDay: 'THURSDAY',
          sequence: 2,
        },
        3: {
          fromTime: { hour: '07', minute: '00', ampm: 'pm' },
          fromDay: 'THURSDAY',
          untilTime: { hour: '07', minute: '00', ampm: 'am' },
          untilDay: 'FRIDAY',
          sequence: 3,
        },
        4: {
          fromTime: { hour: '07', minute: '00', ampm: 'pm' },
          fromDay: 'FRIDAY',
          untilTime: { hour: '07', minute: '00', ampm: 'am' },
          untilDay: 'SATURDAY',
          sequence: 4,
        },
        5: {
          fromTime: { hour: '07', minute: '00', ampm: 'pm' },
          fromDay: 'SATURDAY',
          untilTime: { hour: '07', minute: '00', ampm: 'am' },
          untilDay: 'SUNDAY',
          sequence: 5,
        },
        6: {
          fromTime: { hour: '07', minute: '00', ampm: 'pm' },
          fromDay: 'SUNDAY',
          untilTime: { hour: '07', minute: '00', ampm: 'am' },
          untilDay: 'MONDAY',
          sequence: 6,
        },
      })
    })
  })
})
