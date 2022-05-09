import { Request, Response } from 'express'

import InitialMeetingPlaceRoutes from './initialMeetingPlace'
import LicenceService from '../../../services/licenceService'
import Address from '../types/address'
import UkBankHolidayFeedService from '../../../services/ukBankHolidayFeedService'

const licenceService = new LicenceService(null, null, null) as jest.Mocked<LicenceService>
const ukBankHolidayFeedService = new UkBankHolidayFeedService() as jest.Mocked<UkBankHolidayFeedService>

describe('Route Handlers - Create Licence - Initial Meeting Place', () => {
  const handler = new InitialMeetingPlaceRoutes(licenceService, ukBankHolidayFeedService)
  let req: Request
  let res: Response
  let formAddress: Address

  beforeEach(() => {
    formAddress = {
      addressLine1: 'Manchester Probation Service',
      addressLine2: 'Unit 4',
      addressTown: 'Smith Street',
      addressCounty: 'Stockport',
      addressPostcode: 'SP1 3DN',
    } as unknown as Address

    req = {
      params: {
        licenceId: 1,
      },
      body: formAddress,
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
          appointmentAddress: 'Manchester Probation Service, Unit 4, Smith Street, Stockport, SP1 3DN',
          conditionalReleaseDate: '14/05/2022',
        },
      },
    } as unknown as Response

    licenceService.updateAppointmentAddress = jest.fn()
    ukBankHolidayFeedService.getEnglishAndWelshHolidays = jest.fn()
  })

  describe('GET', () => {
    it('should render view', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/initialMeetingPlace', {
        formAddress,
        releaseIsOnBankHolidayOrWeekend: true,
      })
    })
  })

  describe('POST', () => {
    it('should redirect to the contact page', async () => {
      await handler.POST(req, res)
      expect(licenceService.updateAppointmentAddress).toHaveBeenCalledWith(1, formAddress, { username: 'joebloggs' })
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/initial-meeting-contact')
    })

    it('should redirect to the check your answers page if fromReview flag is set', async () => {
      req.query.fromReview = 'true'
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/check-your-answers')
    })
  })
})
