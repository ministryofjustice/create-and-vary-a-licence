import { Request, Response } from 'express'

import InitialMeetingPlaceRoutes from './initialMeetingPlace'
import LicenceService from '../../../services/licenceService'
import Address from '../types/address'

const licenceService = new LicenceService(null, null, null) as jest.Mocked<LicenceService>

describe('Route Handlers - Create Licence - Initial Meeting Place', () => {
  const handler = new InitialMeetingPlaceRoutes(licenceService)
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
        },
      },
    } as unknown as Response

    licenceService.updateAppointmentAddress = jest.fn()
  })

  describe('GET', () => {
    it('should render view', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/initialMeetingPlace', { formAddress })
    })
  })

  describe('POST', () => {
    it('should redirect to the contact page', async () => {
      await handler.POST(req, res)
      expect(licenceService.updateAppointmentAddress).toHaveBeenCalledWith(1, formAddress, res.locals.user.username)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/initial-meeting-contact')
    })
  })
})
