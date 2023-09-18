import { Request, Response } from 'express'

import InitialMeetingTimeRoutes from './initialMeetingTime'
import LicenceService from '../../../services/licenceService'
import SimpleDateTime from '../types/simpleDateTime'
import UkBankHolidayFeedService from '../../../services/ukBankHolidayFeedService'

const licenceService = new LicenceService(null, null, null, null) as jest.Mocked<LicenceService>
const ukBankHolidayFeedService = new UkBankHolidayFeedService(async () => [])

describe('Route - create licence - initial meeting date and time', () => {
  const handler = new InitialMeetingTimeRoutes(licenceService, ukBankHolidayFeedService)
  let req: Request
  let res: Response
  let formDate: SimpleDateTime

  beforeEach(() => {
    formDate = {
      date: {
        day: '21',
        month: '10',
        year: '2022',
      },
      time: {
        hour: '02',
        minute: '15',
        ampm: 'pm',
      },
    } as unknown as SimpleDateTime

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
          appointmentTime: '21/10/2022 14:15',
          conditionalReleaseDate: '14/05/2022',
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
        releaseIsOnBankHolidayOrWeekend: true,
      })
    })
  })

  describe('POST', () => {
    it('should redirect to the additional licence conditions question page if licence type is AP', async () => {
      res.locals.licence.typeCode = 'AP'

      await handler.POST(req, res)
      expect(licenceService.updateAppointmentTime).toHaveBeenCalledWith(1, formDate, { username: 'joebloggs' })
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/additional-licence-conditions-question')
    })

    it('should redirect to the additional licence conditions question page if licence type is AP_PSS', async () => {
      res.locals.licence.typeCode = 'AP_PSS'

      await handler.POST(req, res)
      expect(licenceService.updateAppointmentTime).toHaveBeenCalledWith(1, formDate, { username: 'joebloggs' })
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/additional-licence-conditions-question')
    })

    it('should redirect to the additional pss conditions question page if licence type is PSS', async () => {
      res.locals.licence.typeCode = 'PSS'

      await handler.POST(req, res)
      expect(licenceService.updateAppointmentTime).toHaveBeenCalledWith(1, formDate, { username: 'joebloggs' })
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/additional-pss-conditions-question')
    })

    it('should redirect to the check your answers page if fromReview flag is set', async () => {
      req.query.fromReview = 'true'
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/check-your-answers')
    })
  })
})
