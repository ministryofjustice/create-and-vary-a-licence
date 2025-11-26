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
      params: {
        licenceId: 1,
      },
      body: telephoneNumbers,
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
          id: 1,
        },
      },
    } as unknown as Response

    licenceService.updateContactNumber = jest.fn()
    licenceService.recordAuditEvent = jest.fn()
  })

  describe('Prison user journey', () => {
    let handler = new InitialMeetingContactRoutes(licenceService, PathType.CREATE)

    describe('GET', () => {
      it('should render view', async () => {
        await handler.GET(req, res)
        expect(res.render).toHaveBeenCalledWith('pages/initialAppointment/prisonCreated/initialMeetingContact', {
          continueOrSaveLabel: 'Continue',
        })
      })

      it('should render view with Save Label', async () => {
        handler = new InitialMeetingContactRoutes(licenceService, PathType.EDIT)
        await handler.GET(req, res)
        expect(res.render).toHaveBeenCalledWith('pages/initialAppointment/prisonCreated/initialMeetingContact', {
          continueOrSaveLabel: 'Save',
        })
      })
    })

    describe('POST', () => {
      it('should redirect to the meeting time page', async () => {
        handler = new InitialMeetingContactRoutes(licenceService, PathType.CREATE)
        await handler.POST(req, res)
        expect(licenceService.updateContactNumber).toHaveBeenCalledWith(
          1,
          { telephone: '0114 2556556' },
          { username: 'joebloggs' },
        )
        expect(res.redirect).toHaveBeenCalledWith('/licence/time-served/create/id/1/initial-meeting-time')
      })

      it('should redirect to the check your answers page', async () => {
        handler = new InitialMeetingContactRoutes(licenceService, PathType.EDIT)
        req = {
          params: {
            licenceId: 1,
          },
          body: telephoneNumbers,
          query: {},
        } as unknown as Request

        await handler.POST(req, res)
        expect(licenceService.updateContactNumber).toHaveBeenCalledWith(
          1,
          { telephone: '0114 2556556' },
          { username: 'joebloggs' },
        )
        expect(res.redirect).toHaveBeenCalledWith('/licence/time-served/edit/id/1/contact-probation-team')
      })

      it('should call to generate a flash message', async () => {
        await handler.POST(req, res)
        expect(flashInitialApptUpdatedMessage).toHaveBeenCalledWith(req, res.locals.licence, UserType.PRISON)
      })
    })
  })
})
