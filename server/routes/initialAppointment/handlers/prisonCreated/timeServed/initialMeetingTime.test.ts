import { Request, Response } from 'express'

import InitialMeetingTimeRoutes from './initialMeetingTime'
import LicenceService from '../../../../../services/licenceService'
import DateTime from '../../../types/dateTime'
import UserType from '../../../../../enumeration/userType'
import AppointmentTimeType from '../../../../../enumeration/appointmentTimeType'
import flashInitialApptUpdatedMessage from '../../initialMeetingUpdatedFlashMessage'
import PathType from '../../../../../enumeration/pathType'

jest.mock('../../initialMeetingUpdatedFlashMessage')

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
          statusCode: 'SUBMITTED',
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

  describe('TimeServed licence prison user journey', () => {
    let handler = new InitialMeetingTimeRoutes(licenceService, PathType.CREATE)

    describe('GET', () => {
      it('should render initial meeting time view', async () => {
        // Given
        handler = new InitialMeetingTimeRoutes(licenceService, PathType.CREATE)

        // When
        await handler.GET(req, res)

        // Then
        expect(res.render).toHaveBeenCalledWith('pages/initialAppointment/prisonCreated/initialMeetingTime', {
          formDate,
          appointmentTimeType,
          continueOrSaveLabel: 'Continue',
        })
      })

      it('should render initial meeting time view with Save label when editing', async () => {
        // Given
        handler = new InitialMeetingTimeRoutes(licenceService, PathType.EDIT)

        // When
        await handler.GET(req, res)

        // Then
        expect(res.render).toHaveBeenCalledWith('pages/initialAppointment/prisonCreated/initialMeetingTime', {
          formDate,
          appointmentTimeType,
          continueOrSaveLabel: 'Save',
        })
      })
    })

    describe('POST', () => {
      it('should redirect to next page when PathType is CREATE', async () => {
        // Given
        handler = new InitialMeetingTimeRoutes(licenceService, PathType.CREATE)

        // When
        await handler.POST(req, res)

        // Then
        expect(licenceService.updateAppointmentTime).toHaveBeenCalledWith(1, formDate, { username: 'joebloggs' })
        expect(res.redirect).toHaveBeenCalledWith('/licence/time-served/id/1/check-your-answers')
      })

      it('should generate flash message on save', async () => {
        // Given
        handler = new InitialMeetingTimeRoutes(licenceService, PathType.CREATE)

        // When
        await handler.POST(req, res)

        // Then
        expect(flashInitialApptUpdatedMessage).toHaveBeenCalledWith(req, res.locals.licence, UserType.PRISON)
      })

      it('should redirect to edit path when PathType is EDIT', async () => {
        // Given
        handler = new InitialMeetingTimeRoutes(licenceService, PathType.EDIT)
        res.locals.licence.statusCode = 'SUBMITTED'

        // When
        await handler.POST(req, res)

        // Then
        expect(res.redirect).toHaveBeenCalledWith(`/licence/time-served/${PathType.EDIT}/id/1/contact-probation-team`)
      })
    })
  })
})
