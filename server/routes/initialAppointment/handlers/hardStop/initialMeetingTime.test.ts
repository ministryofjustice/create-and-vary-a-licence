import { Request, Response } from 'express'

import InitialMeetingTimeRoutes from './initialMeetingTime'
import LicenceService from '../../../../services/licenceService'
import DateTime from '../../types/dateTime'
import UserType from '../../../../enumeration/userType'
import AppointmentTimeType from '../../../../enumeration/appointmentTimeType'
import flashInitialApptUpdatedMessage from '../initialMeetingUpdatedFlashMessage'

jest.mock('../initialMeetingUpdatedFlashMessage')

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

  describe('Hardstop licence prison user journey', () => {
    const handler = new InitialMeetingTimeRoutes(licenceService, UserType.PRISON)

    describe('GET', () => {
      it('should render initial meeting time view', async () => {
        await handler.GET(req, res)
        expect(res.render).toHaveBeenCalledWith('pages/create/hardStop/initialMeetingTime', {
          formDate,
          appointmentTimeType,
        })
      })
    })

    describe('POST', () => {
      it('should redirect to the next page', async () => {
        await handler.POST(req, res)
        expect(licenceService.updateAppointmentTime).toHaveBeenCalledWith(1, formDate, { username: 'joebloggs' })
        expect(res.redirect).toHaveBeenCalledWith('/licence/hard-stop/id/1/check-your-answers')
      })

      it('should call to generate a flash message', async () => {
        await handler.POST(req, res)
        expect(flashInitialApptUpdatedMessage).toHaveBeenCalledWith(req, res.locals.licence, UserType.PRISON)
      })
    })
  })
})
