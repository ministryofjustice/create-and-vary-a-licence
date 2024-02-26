import { Request, Response } from 'express'

import InitialMeetingPlaceRoutes from './initialMeetingPlace'
import LicenceService from '../../../../services/licenceService'
import Address from '../../types/address'
import UserType from '../../../../enumeration/userType'
import flashInitialApptUpdatedMessage from '../initialMeetingUpdatedFlashMessage'

jest.mock('../initialMeetingUpdatedFlashMessage')

const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>

describe('Route Handlers - Create Licence - Initial Meeting Place', () => {
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
          isEligibleForEarlyRelease: true,
        },
      },
    } as unknown as Response

    licenceService.updateAppointmentAddress = jest.fn()
    licenceService.recordAuditEvent = jest.fn()
  })
  describe('Hardstop licence prison user journey', () => {
    const handler = new InitialMeetingPlaceRoutes(licenceService, UserType.PRISON)

    describe('GET', () => {
      it('should render view', async () => {
        await handler.GET(req, res)
        expect(res.render).toHaveBeenCalledWith('pages/create/hardStop/initialMeetingPlace', { formAddress })
      })
    })

    describe('POST', () => {
      it('should redirect to the initial meeting contact page', async () => {
        await handler.POST(req, res)
        expect(licenceService.updateAppointmentAddress).toHaveBeenCalledWith(1, formAddress, { username: 'joebloggs' })
        expect(res.redirect).toHaveBeenCalledWith('/licence/hard-stop/create/id/1/initial-meeting-contact')
      })

      it('should redirect to the check your answers page page', async () => {
        req = {
          params: {
            licenceId: 1,
          },
          body: formAddress,
          query: {},
          path: 'edit',
        } as unknown as Request
        await handler.POST(req, res)
        expect(licenceService.updateAppointmentAddress).toHaveBeenCalledWith(1, formAddress, { username: 'joebloggs' })
        expect(res.redirect).toHaveBeenCalledWith('/licence/hard-stop/id/1/check-your-answers')
      })

      it('should call to generate a flash message', async () => {
        await handler.POST(req, res)
        expect(flashInitialApptUpdatedMessage).toHaveBeenCalledWith(req, res.locals.licence, UserType.PRISON)
      })
    })
  })
})
