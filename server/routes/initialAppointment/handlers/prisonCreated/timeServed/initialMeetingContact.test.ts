import { Request, Response } from 'express'

import InitialMeetingContactRoutes from './initialMeetingContact'
import LicenceService from '../../../../../services/licenceService'
import TelephoneNumbers from '../../../types/telephoneNumbers'
import UserType from '../../../../../enumeration/userType'
import flashInitialApptUpdatedMessage from '../../initialMeetingUpdatedFlashMessage'
import PathType from '../../../../../enumeration/pathType'

jest.mock('../../initialMeetingUpdatedFlashMessage')

const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>

describe('Route Handlers - Create Licence - Initial Meeting Contact', () => {
  let req: Request
  let res: Response
  let telephoneNumbers: TelephoneNumbers

  beforeEach(() => {
    telephoneNumbers = {
      telephone: '0114 2556556',
    } as TelephoneNumbers

    req = {
      params: { licenceId: 1 },
      body: telephoneNumbers,
      query: {},
    } as unknown as Request

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
      locals: {
        user: { username: 'joebloggs' },
        licence: {
          id: 1,
          statusCode: 'SUBMITTED', // default unless overridden
        },
      },
    } as unknown as Response

    licenceService.updateContactNumber = jest.fn()
  })

  describe('Prison user journey', () => {
    describe('GET', () => {
      it('should render view with Continue label', async () => {
        // Given
        const handler = new InitialMeetingContactRoutes(licenceService, PathType.CREATE)

        // When
        await handler.GET(req, res)

        // Then
        expect(res.render).toHaveBeenCalledWith('pages/initialAppointment/prisonCreated/initialMeetingContact', {
          continueOrSaveLabel: 'Continue',
          edit: undefined,
        })
      })

      it('should pass edit query param through to template', async () => {
        // Given
        req.query = { edit: 'true' }
        const handler = new InitialMeetingContactRoutes(licenceService, PathType.CREATE)

        // When
        await handler.GET(req, res)

        // Then
        expect(res.render).toHaveBeenCalledWith('pages/initialAppointment/prisonCreated/initialMeetingContact', {
          continueOrSaveLabel: 'Continue',
          edit: 'true',
        })
      })

      it('should render view with Save label', async () => {
        // Given
        const handler = new InitialMeetingContactRoutes(licenceService, PathType.EDIT)

        // When
        await handler.GET(req, res)

        // Then
        expect(res.render).toHaveBeenCalledWith('pages/initialAppointment/prisonCreated/initialMeetingContact', {
          continueOrSaveLabel: 'Save',
          edit: undefined,
        })
      })
    })

    describe('POST', () => {
      it('should update contact number and redirect to initial meeting time page', async () => {
        // Given
        const handler = new InitialMeetingContactRoutes(licenceService, PathType.CREATE)

        // When
        await handler.POST(req, res)

        // Then
        expect(licenceService.updateContactNumber).toHaveBeenCalledWith(1, telephoneNumbers, { username: 'joebloggs' })
        expect(res.redirect).toHaveBeenCalledWith('/licence/time-served/create/id/1/initial-meeting-time')
      })

      it('should redirect to check your answers if status is IN_PROGRESS', async () => {
        // Given
        const handler = new InitialMeetingContactRoutes(licenceService, PathType.EDIT)
        res.locals.licence.statusCode = 'IN_PROGRESS'

        // When
        await handler.POST(req, res)

        // Then
        expect(res.redirect).toHaveBeenCalledWith('/licence/time-served/id/1/check-your-answers')
      })

      it('should redirect to check your answers for EDIT flow when not in progress', async () => {
        // Given
        const handler = new InitialMeetingContactRoutes(licenceService, PathType.EDIT)
        res.locals.licence.statusCode = 'SUBMITTED'

        // When
        await handler.POST(req, res)

        // Then
        expect(res.redirect).toHaveBeenCalledWith('/licence/time-served/id/1/check-your-answers')
      })

      it('should call flash message generator', async () => {
        // Given
        const handler = new InitialMeetingContactRoutes(licenceService, PathType.CREATE)

        // When
        await handler.POST(req, res)

        // Then
        expect(flashInitialApptUpdatedMessage).toHaveBeenCalledWith(req, res.locals.licence, UserType.PRISON)
      })
    })
  })
})
