import { Request, Response } from 'express'

import InitialMeetingContactRoutes from './initialMeetingContact'
import LicenceService from '../../../../services/licenceService'
import Telephone from '../../types/telephone'
import UserType from '../../../../enumeration/userType'
import flashInitialApptUpdatedMessage from '../initialMeetingUpdatedFlashMessage'

jest.mock('../initialMeetingUpdatedFlashMessage')

const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>

describe('Route Handlers - Create Licence - Initial Meeting Contact', () => {
  let req: Request
  let res: Response
  let contactNumber: Telephone

  beforeEach(() => {
    contactNumber = {
      telephone: '0114 2556556',
    } as Telephone

    req = {
      params: {
        licenceId: 1,
      },
      body: contactNumber,
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

  describe('Prison user journey', () => {
    const handler = new InitialMeetingContactRoutes(licenceService, UserType.PRISON)

    describe('GET', () => {
      it('should render view', async () => {
        await handler.GET(req, res)
        expect(res.render).toHaveBeenCalledWith('pages/create/hardStop/initialMeetingContact')
      })
    })

    describe('POST', () => {
      it('should redirect to the meeting time page', async () => {
        await handler.POST(req, res)
        expect(licenceService.updateContactNumber).toHaveBeenCalledWith(
          1,
          { telephone: '0114 2556556' },
          { username: 'joebloggs' }
        )
        expect(res.redirect).toHaveBeenCalledWith('/licence/hard-stop/create/id/1/initial-meeting-time')
      })

      it('should redirect to the check your answers page', async () => {
        req = {
          params: {
            licenceId: 1,
          },
          body: contactNumber,
          query: {},
          originalUrl: 'edit',
        } as unknown as Request
        await handler.POST(req, res)
        expect(licenceService.updateContactNumber).toHaveBeenCalledWith(
          1,
          { telephone: '0114 2556556' },
          { username: 'joebloggs' }
        )
        expect(res.redirect).toHaveBeenCalledWith('/licence/hard-stop/id/1/check-your-answers')
      })

      it('should call to generate a flash message', async () => {
        await handler.POST(req, res)
        expect(flashInitialApptUpdatedMessage).toHaveBeenCalledWith(req, res.locals.licence, UserType.PRISON)
      })
    })
  })
})
