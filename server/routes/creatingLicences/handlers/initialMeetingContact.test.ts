import { Request, Response } from 'express'

import InitialMeetingContactRoutes from './initialMeetingContact'
import LicenceService from '../../../services/licenceService'
import Telephone from '../types/telephone'

const licenceService = new LicenceService(null, null, null, null) as jest.Mocked<LicenceService>

describe('Route Handlers - Create Licence - Initial Meeting Contact', () => {
  const handler = new InitialMeetingContactRoutes(licenceService)
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
    } as unknown as Request

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
      locals: {
        user: {
          username: 'joebloggs',
        },
      },
    } as unknown as Response

    licenceService.updateContactNumber = jest.fn()
  })

  describe('GET', () => {
    it('should render view', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/initialMeetingContact')
    })
  })

  describe('POST', () => {
    it('should redirect to the meeting time page', async () => {
      await handler.POST(req, res)
      expect(licenceService.updateContactNumber).toHaveBeenCalledWith(1, contactNumber, res.locals.user.username)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/initial-meeting-time')
    })
  })
})
