import { Request, Response } from 'express'

import InitialMeetingTimeRoutes from './initialMeetingTime'
import LicenceService from '../../../services/licenceService'
import SimpleDateTime from '../types/simpleDateTime'

const licenceService = new LicenceService(null, null, null) as jest.Mocked<LicenceService>

describe('Route - create licence - initial meeting date and time', () => {
  const handler = new InitialMeetingTimeRoutes(licenceService)
  let req: Request
  let res: Response
  let formDate: SimpleDateTime

  beforeEach(() => {
    formDate = {
      inductionDate: {
        day: '21',
        month: '10',
        year: '2022',
      },
      inductionTime: {
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
        },
      },
    } as unknown as Response

    licenceService.updateAppointmentTime = jest.fn()
  })

  describe('GET', () => {
    it('should render initial meeting time view', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/initialMeetingTime', { formDate })
    })
  })

  describe('POST', () => {
    it('should redirect to the additional conditions question page', async () => {
      await handler.POST(req, res)
      expect(licenceService.updateAppointmentTime).toHaveBeenCalledWith(1, formDate, res.locals.user.username)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/additional-conditions-question')
    })
  })
})
