import { Request, Response } from 'express'

import InitialMeetingNameRoutes from './initialMeetingName'
import LicenceService from '../../../services/licenceService'

const licenceService = new LicenceService(null, null, null) as jest.Mocked<LicenceService>

describe('Route Handlers - Create Licence - Initial Meeting Name', () => {
  const handler = new InitialMeetingNameRoutes(licenceService)
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
      },
    } as unknown as Response
    licenceService.updateAppointmentPerson = jest.fn()
  })

  describe('GET', () => {
    it('should render view', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/initialMeetingPerson')
    })
  })

  describe('POST', () => {
    it('should redirect to the meeting place page', async () => {
      await handler.POST(req, res)
      expect(licenceService.updateAppointmentPerson).toHaveBeenCalledWith('1', {}, 'joebloggs')
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/initial-meeting-place')
    })

    it('should redirect to the check your answers page if fromReview flag is set', async () => {
      req.query.fromReview = 'true'
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/check-your-answers')
    })
  })
})
