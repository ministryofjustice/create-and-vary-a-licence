import { Request, Response } from 'express'

import InitialMeetingContactRoutes from './initialMeetingContact'
import LicenceService from '../../../services/licenceService'
import Telephone from '../types/telephone'
import UkBankHolidayFeedService from '../../../services/ukBankHolidayFeedService'

const licenceService = new LicenceService(null, null, null) as jest.Mocked<LicenceService>
const ukBankHolidayFeedService = new UkBankHolidayFeedService() as jest.Mocked<UkBankHolidayFeedService>

describe('Route Handlers - Create Licence - Initial Meeting Contact', () => {
  const handler = new InitialMeetingContactRoutes(licenceService, ukBankHolidayFeedService)
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
        },
      },
    } as unknown as Response

    licenceService.updateContactNumber = jest.fn()
    ukBankHolidayFeedService.getEnglishAndWelshHolidays = jest.fn()
  })

  describe('GET', () => {
    it('should render view', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/initialMeetingContact', {
        releaseIsOnBankHolidayOrWeekend: true,
      })
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
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/initial-meeting-time')
    })

    it('should redirect to the check your answers page if fromReview flag is set', async () => {
      req.query.fromReview = 'true'
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/check-your-answers')
    })
  })
})
