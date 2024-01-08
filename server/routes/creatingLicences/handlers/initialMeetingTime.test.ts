import { Request, Response } from 'express'

import InitialMeetingTimeRoutes from './initialMeetingTime'
import LicenceService from '../../../services/licenceService'
import DateTime from '../types/dateTime'
import AppointmentTimeType from '../../../enumeration/appointmentTimeType'

const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>

describe('Route - create licence - initial meeting date and time', () => {
  const handler = new InitialMeetingTimeRoutes(licenceService)
  let req: Request
  let res: Response
  let formDate: DateTime
  const appointmentTimeType: Record<string, string> = AppointmentTimeType

  beforeEach(() => {
    formDate = {
      date: { calendarDate: '21/10/2022' },
      time: {
        hour: '02',
        minute: '15',
        ampm: 'pm',
      },
    } as unknown as DateTime

    req = {
      params: {
        licenceId: 1,
      },
      body: formDate,
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
          appointmentTime: '21/10/2022 14:15',
          conditionalReleaseDate: '14/05/2022',
          isEligibleForEarlyRelease: true,
        },
      },
    } as unknown as Response

    licenceService.updateAppointmentTime = jest.fn()
  })

  describe('GET', () => {
    it('should render initial meeting time view', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/initialMeetingTime', {
        formDate,
        appointmentTimeType,
        releaseIsOnBankHolidayOrWeekend: true,
        skipUrl: '/licence/create/id/1/additional-pss-conditions-question',
      })
    })
  })

  describe('POST', () => {
    it('should update the appointment address', async () => {
      await handler.POST(req, res)
      expect(licenceService.updateAppointmentTime).toHaveBeenCalledWith(1, formDate, { username: 'joebloggs' })
    })

    it('should redirect to the next page', async () => {
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/additional-pss-conditions-question')
    })
  })

  describe('getNextPage', () => {
    it('should redirect to the additional licence conditions question page if licence type is AP', async () => {
      res.locals.licence.typeCode = 'AP'
      expect(handler.getNextPage('1', res.locals.licence.typeCode, req)).toBe(
        '/licence/create/id/1/additional-licence-conditions-question'
      )
    })

    it('should redirect to the additional licence conditions question page if licence type is AP_PSS', async () => {
      res.locals.licence.typeCode = 'AP_PSS'
      expect(handler.getNextPage('1', res.locals.licence.typeCode, req)).toBe(
        '/licence/create/id/1/additional-licence-conditions-question'
      )
    })

    it('should redirect to the additional pss conditions question page if licence type is PSS', async () => {
      res.locals.licence.typeCode = 'PSS'
      expect(handler.getNextPage('1', res.locals.licence.typeCode, req)).toBe(
        '/licence/create/id/1/additional-pss-conditions-question'
      )
    })

    it('should redirect to the check your answers page if fromReview flag is set', async () => {
      req.query.fromReview = 'true'
      expect(handler.getNextPage('1', res.locals.licence.typeCode, req)).toBe('/licence/create/id/1/check-your-answers')
    })
  })
})
