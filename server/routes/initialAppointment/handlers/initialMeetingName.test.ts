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
      it('should render view', async () => {
        await handler.GET(req, res)
        expect(res.render).toHaveBeenCalledWith('pages/initialAppointment/initialMeetingName')
      })
    })

    describe('POST', () => {
      it('should redirect to the meeting place page', async () => {
        await handler.POST(req, res)
        expect(licenceService.updateAppointmentPerson).toHaveBeenCalledWith('1', {}, { username: 'joebloggs' })
        expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/initial-meeting-place')
      })

      it('should redirect to the check your answers page if fromReview flag is set', async () => {
        req.query.fromReview = 'true'
        await handler.POST(req, res)
        expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/check-your-answers')
      })

      it('should call to generate a flash message', async () => {
        await handler.POST(req, res)
        expect(flashInitialApptUpdatedMessage).toHaveBeenCalledWith(req, res.locals.licence, UserType.PROBATION)
      })
    })
  })

  describe('Prison user journey', () => {
    const handler = new InitialMeetingNameRoutes(licenceService, UserType.PRISON)

    describe('GET', () => {
      it('should render view', async () => {
        await handler.GET(req, res)
        expect(res.render).toHaveBeenCalledWith('pages/initialAppointment/initialMeetingName')
      })
    })

    describe('POST', () => {
      it('should redirect to the show page', async () => {
        await handler.POST(req, res)
        expect(licenceService.updateAppointmentPerson).toHaveBeenCalledWith('1', {}, { username: 'joebloggs' })
        expect(res.redirect).toHaveBeenCalledWith('/licence/view/id/1/show')
      })

      it('should call to generate a flash message', async () => {
        await handler.POST(req, res)
        expect(flashInitialApptUpdatedMessage).toHaveBeenCalledWith(req, res.locals.licence, UserType.PRISON)
      })
    })
  })
})
