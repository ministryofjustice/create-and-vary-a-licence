import { Request, Response } from 'express'

import InitialMeetingContactRoutes from './initialMeetingContact'
import LicenceService from '../../../services/licenceService'
import TelephoneNumbers from '../types/telephoneNumbers'
import UserType from '../../../enumeration/userType'
import flashInitialApptUpdatedMessage from './initialMeetingUpdatedFlashMessage'

jest.mock('./initialMeetingUpdatedFlashMessage')

const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>

describe('Route Handlers - Create Licence - Initial Meeting Contact', () => {
  let req: Request
  let res: Response
  let telephoneNumbers: TelephoneNumbers

  beforeEach(() => {
    telephoneNumbers = {
      telephone: '0114 2556556',
      telephoneAlternative: '0114 2556558',
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
        },
      },
    } as unknown as Response

    licenceService.updateContactNumber = jest.fn()
    licenceService.recordAuditEvent = jest.fn()
  })

  describe('Probation user journey', () => {
    const handler = new InitialMeetingContactRoutes(licenceService, UserType.PROBATION)

    describe('GET', () => {
      it('should render view', async () => {
        req.query = { edit: 'telNumber' }
        await handler.GET(req, res)
        expect(res.render).toHaveBeenCalledWith('pages/initialAppointment/initialMeetingContact', { edit: 'telNumber' })
      })
    })

    describe('POST', () => {
      it('should redirect to the meeting time page', async () => {
        await handler.POST(req, res)
        expect(licenceService.updateContactNumber).toHaveBeenCalledWith(
          1,
          { telephone: '0114 2556556', telephoneAlternative: '0114 2556558' },
          { username: 'joebloggs' },
        )
        expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/initial-meeting-time')
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
    const handler = new InitialMeetingContactRoutes(licenceService, UserType.PRISON)

    describe('GET', () => {
      it('should render view', async () => {
        req.query = { edit: 'telNumber' }
        await handler.GET(req, res)
        expect(res.render).toHaveBeenCalledWith('pages/initialAppointment/initialMeetingContact', { edit: 'telNumber' })
      })
    })

    describe('POST', () => {
      it('should redirect to the show page', async () => {
        await handler.POST(req, res)
        expect(licenceService.updateContactNumber).toHaveBeenCalledWith(
          1,
          { telephone: '0114 2556556', telephoneAlternative: '0114 2556558' },
          { username: 'joebloggs' },
        )
        expect(res.redirect).toHaveBeenCalledWith('/licence/view/id/1/show')
      })

      it('should call to generate a flash message', async () => {
        await handler.POST(req, res)
        expect(flashInitialApptUpdatedMessage).toHaveBeenCalledWith(req, res.locals.licence, UserType.PRISON)
      })
    })
  })
})
