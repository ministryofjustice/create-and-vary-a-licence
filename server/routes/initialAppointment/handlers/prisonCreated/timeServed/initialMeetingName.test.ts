import { Request, Response } from 'express'

import InitialMeetingNameRoutes from './initialMeetingName'
import LicenceService from '../../../../../services/licenceService'
import { AppointmentPersonRequest } from '../../../../../@types/licenceApiClientTypes'
import PathType from '../../../../../enumeration/pathType'
import flashInitialApptUpdatedFlashMessage from '../../initialMeetingUpdatedFlashMessage'
import UserType from '../../../../../enumeration/userType'

jest.mock('../../initialMeetingUpdatedFlashMessage')

const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>

describe('Route Handlers - Create Licence - Initial Meeting Name', () => {
  let req: Request
  let res: Response
  const contactPerson = {
    appointmentPersonType: 'SPECIFIC_PERSON',
    appointmentPerson: 'specific person',
  } as AppointmentPersonRequest

  beforeEach(() => {
    req = {
      params: { licenceId: '1' },
      body: contactPerson,
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
          responsibleComFullName: 'FirstName SecondName',
          statusCode: 'SUBMITTED',
        },
      },
    } as unknown as Response

    licenceService.updateAppointmentPerson = jest.fn()
  })

  describe('GET', () => {
    it('should render view with probation practitioner allocated', async () => {
      // Given
      const handler = new InitialMeetingNameRoutes(licenceService, PathType.CREATE)

      // When
      await handler.GET(req, res)

      // Then
      expect(res.render).toHaveBeenCalledWith('pages/initialAppointment/prisonCreated/initialMeetingPerson', {
        appointmentPersonType: {
          DUTY_OFFICER: 'Duty officer',
          RESPONSIBLE_COM: 'FirstName SecondName, this person’s community probation practitioner',
          SPECIFIC_PERSON: 'Someone else',
        },
        continueOrSaveLabel: 'Continue',
        isProbationPractionerAllocated: true,
      })
    })

    it('should render view without probation practitioner allocated', async () => {
      // Given
      res.locals.licence.responsibleComFullName = null
      const handler = new InitialMeetingNameRoutes(licenceService, PathType.CREATE)

      // When
      await handler.GET(req, res)

      // Then
      expect(res.render).toHaveBeenCalledWith('pages/initialAppointment/prisonCreated/initialMeetingPerson', {
        appointmentPersonType: {
          DUTY_OFFICER: 'Duty officer',
          SPECIFIC_PERSON: 'Someone else',
        },
        continueOrSaveLabel: 'Continue',
        isProbationPractionerAllocated: false,
      })
    })

    it('should show Save label when path is EDIT', async () => {
      // Given
      const handler = new InitialMeetingNameRoutes(licenceService, PathType.EDIT)

      // When
      await handler.GET(req, res)

      // Then
      expect(res.render).toHaveBeenCalledWith(
        'pages/initialAppointment/prisonCreated/initialMeetingPerson',
        expect.objectContaining({
          continueOrSaveLabel: 'Save',
        }),
      )
    })
  })

  describe('POST', () => {
    it('should redirect to the meeting place page for CREATE', async () => {
      // Given
      const handler = new InitialMeetingNameRoutes(licenceService, PathType.CREATE)

      // When
      await handler.POST(req, res)

      // Then
      expect(licenceService.updateAppointmentPerson).toHaveBeenCalledWith('1', contactPerson, { username: 'joebloggs' })
      expect(res.redirect).toHaveBeenCalledWith('/licence/time-served/create/id/1/initial-meeting-place')
    })

    it('should redirect to check-your-answers when EDIT + IN_PROGRESS', async () => {
      // Given
      const handler = new InitialMeetingNameRoutes(licenceService, PathType.EDIT)
      res.locals.licence.statusCode = 'IN_PROGRESS'

      // When
      await handler.POST(req, res)

      // Then
      expect(res.redirect).toHaveBeenCalledWith('/licence/time-served/id/1/check-your-answers')
    })

    it('should redirect to contact probation team when EDIT + not IN_PROGRESS', async () => {
      // Given
      const handler = new InitialMeetingNameRoutes(licenceService, PathType.EDIT)
      res.locals.licence.statusCode = 'SUBMITTED'

      // When
      await handler.POST(req, res)

      // Then
      expect(res.redirect).toHaveBeenCalledWith('/licence/time-served/edit/id/1/contact-probation-team')
    })

    it('should call flash message generator', async () => {
      // Given
      const handler = new InitialMeetingNameRoutes(licenceService, PathType.CREATE)

      // When
      await handler.POST(req, res)

      // Then
      expect(flashInitialApptUpdatedFlashMessage).toHaveBeenCalledWith(req, res.locals.licence, UserType.PRISON)
    })
  })
})
