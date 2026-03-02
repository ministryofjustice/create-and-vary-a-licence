import { Request, Response } from 'express'

import InitialMeetingNameRoutes from './initialMeetingName'
import LicenceService from '../../../services/licenceService'
import UserType from '../../../enumeration/userType'
import flashInitialApptUpdatedMessage from './initialMeetingUpdatedFlashMessage'

jest.mock('./initialMeetingUpdatedFlashMessage')

const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>

describe('Route Handlers - Create Licence - Initial Meeting Name - Probation users', () => {
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      params: {
        licenceId: '1',
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
          conditionalReleaseDate: '14/05/2022',
          isEligibleForEarlyRelease: true,
        },
      },
    } as unknown as Response

    licenceService.updateAppointmentPerson = jest.fn()
    licenceService.recordAuditEvent = jest.fn()
  })

  describe('Probation user journey', () => {
    const handler = new InitialMeetingNameRoutes(licenceService, UserType.PROBATION)

    describe('GET', () => {
      it('should render view without responsible COM option when not allocated', async () => {
        // Given
        res.locals.licence.responsibleComFullName = undefined

        // When
        await handler.GET(req, res)

        // Then
        expect(res.render).toHaveBeenCalledWith('pages/initialAppointment/initialMeetingName', {
          appointmentPersonType: {
            DUTY_OFFICER: 'Duty officer',
            SPECIFIC_PERSON: 'Someone else',
          },
          userType: UserType.PROBATION,
        })
      })

      it('should include responsible COM option when allocated', async () => {
        // Given
        res.locals.licence.responsibleComFullName = 'Test Tester'

        // When
        await handler.GET(req, res)

        // Then
        expect(res.render).toHaveBeenCalledWith('pages/initialAppointment/initialMeetingName', {
          appointmentPersonType: {
            DUTY_OFFICER: 'Duty officer',
            RESPONSIBLE_COM: 'Test Tester, this person’s community probation practitioner',
            SPECIFIC_PERSON: 'Someone else',
          },
          userType: UserType.PROBATION,
        })
      })
    })

    describe('POST', () => {
      it('should redirect to the meeting place page', async () => {
        // Given

        // When
        await handler.POST(req, res)

        // Then
        expect(licenceService.updateAppointmentPerson).toHaveBeenCalledWith('1', {}, { username: 'joebloggs' })
        expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/initial-meeting-place')
      })

      it('should redirect to the check your answers page if fromReview flag is set', async () => {
        // Given
        req.query.fromReview = 'true'

        // When
        await handler.POST(req, res)

        // Then
        expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/check-your-answers')
      })

      it('should call to generate a flash message', async () => {
        // Given

        // When
        await handler.POST(req, res)

        // Then
        expect(flashInitialApptUpdatedMessage).toHaveBeenCalledWith(req, res.locals.licence, UserType.PROBATION)
      })
    })
  })

  describe('Prison user journey', () => {
    const handler = new InitialMeetingNameRoutes(licenceService, UserType.PRISON)

    describe('GET', () => {
      it('should render view with prison user type', async () => {
        // Given

        // When
        await handler.GET(req, res)

        // Then
        expect(res.render).toHaveBeenCalledWith(
          'pages/initialAppointment/initialMeetingName',
          expect.objectContaining({ userType: UserType.PRISON }),
        )
      })
    })

    describe('POST', () => {
      it('should redirect to the show page', async () => {
        // Given

        // When
        await handler.POST(req, res)

        // Then
        expect(licenceService.updateAppointmentPerson).toHaveBeenCalledWith('1', {}, { username: 'joebloggs' })
        expect(res.redirect).toHaveBeenCalledWith('/licence/view/id/1/show')
      })

      it('should call to generate a flash message', async () => {
        // Given

        // When
        await handler.POST(req, res)

        // Then
        expect(flashInitialApptUpdatedMessage).toHaveBeenCalledWith(req, res.locals.licence, UserType.PRISON)
      })
    })
  })
})
