import { Request, Response } from 'express'

import InitialMeetingTimeRoutes from './initialMeetingTime'
import LicenceService from '../../../services/licenceService'
import DateTime from '../types/dateTime'
import UserType from '../../../enumeration/userType'
import AppointmentTimeType from '../../../enumeration/appointmentTimeType'
import flashInitialApptUpdatedMessage from './initialMeetingUpdatedFlashMessage'

jest.mock('./initialMeetingUpdatedFlashMessage')

const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>

describe('Route - create licence - initial meeting date and time', () => {
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
          appointmentTimeType: 'SPECIFIC_DATE_TIME',
          conditionalReleaseDate: '14/05/2022',
          isEligibleForEarlyRelease: true,
        },
      },
    } as unknown as Response

    licenceService.updateAppointmentTime = jest.fn()
    licenceService.recordAuditEvent = jest.fn()
  })

  describe('Probation user journey', () => {
    const handler = new InitialMeetingTimeRoutes(licenceService, UserType.PROBATION)

    describe('GET', () => {
      it('should render initial meeting time view', async () => {
        await handler.GET(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/initialAppointment/initialMeetingTime', {
          formDate,
          appointmentTimeType,
          skipUrl: '/licence/create/id/1/additional-pss-conditions-question',
          canSkip: false,
        })
      })

      it('should let the PP skip the date input if one has not be entered previously', async () => {
        res.locals.licence = { ...res.locals.licence, appointmentTime: null, appointmentTimeType: null }

        await handler.GET(req, res)
        expect(res.render).toHaveBeenCalledWith('pages/initialAppointment/initialMeetingTime', {
          formDate: undefined,
          appointmentTimeType,
          skipUrl: '/licence/create/id/1/additional-pss-conditions-question',
          canSkip: true,
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

      it('should call to generate a flash message', async () => {
        await handler.POST(req, res)
        expect(flashInitialApptUpdatedMessage).toHaveBeenCalledWith(req, res.locals.licence, UserType.PROBATION)
      })
    })

    describe('getNextPage', () => {
      it('should redirect to the additional licence conditions question page if licence type is AP', async () => {
        res.locals.licence.typeCode = 'AP'
        expect(handler.getNextPage(res.locals.licence, req)).toBe(
          '/licence/create/id/1/additional-licence-conditions-question',
        )
      })

      it('should redirect to the additional licence conditions question page if licence type is AP_PSS', async () => {
        res.locals.licence.typeCode = 'AP_PSS'
        expect(handler.getNextPage(res.locals.licence, req)).toBe(
          '/licence/create/id/1/additional-licence-conditions-question',
        )
      })

      it('should redirect to the additional pss conditions question page if licence type is PSS', async () => {
        res.locals.licence.typeCode = 'PSS'
        expect(handler.getNextPage(res.locals.licence, req)).toBe(
          '/licence/create/id/1/additional-pss-conditions-question',
        )
      })

      it('should redirect to the standard HDC curfew questions page if the licence kind is HDC', async () => {
        res.locals.licence.typeCode = 'AP_PSS'
        res.locals.licence.kind = 'HDC'
        expect(handler.getNextPage(res.locals.licence, req)).toBe(
          '/licence/create/id/1/hdc/standard-curfew-hours-question',
        )
      })

      it('should redirect to the check your answers page if fromReview flag is set', async () => {
        req.query.fromReview = 'true'
        expect(handler.getNextPage(res.locals.licence, req)).toBe('/licence/create/id/1/check-your-answers')
      })
    })
  })

  describe('Prison user journey', () => {
    const handler = new InitialMeetingTimeRoutes(licenceService, UserType.PRISON)

    describe('GET', () => {
      it('should render initial meeting time view', async () => {
        await handler.GET(req, res)
        expect(res.render).toHaveBeenCalledWith('pages/initialAppointment/initialMeetingTime', {
          formDate,
          appointmentTimeType,
          skipUrl: '/licence/view/id/1/show',
          canSkip: false,
        })
      })
    })

    describe('POST', () => {
      it('should redirect to the next page', async () => {
        await handler.POST(req, res)
        expect(licenceService.updateAppointmentTime).toHaveBeenCalledWith(1, formDate, { username: 'joebloggs' })
        expect(res.redirect).toHaveBeenCalledWith('/licence/view/id/1/show')
      })

      it('should call to generate a flash message', async () => {
        await handler.POST(req, res)
        expect(flashInitialApptUpdatedMessage).toHaveBeenCalledWith(req, res.locals.licence, UserType.PRISON)
      })
    })

    describe('getNextPage', () => {
      it('should redirect to the show page', async () => {
        expect(handler.getNextPage(res.locals.licence, req)).toBe('/licence/view/id/1/show')
      })
    })
  })
})
