import { Request, Response } from 'express'

import InitialMeetingPlaceRoutes from './initialMeetingPlace'
import LicenceService from '../../../../services/licenceService'
import Address from '../../types/address'
import UserType from '../../../../enumeration/userType'
import flashInitialApptUpdatedMessage from '../initialMeetingUpdatedFlashMessage'
import PathType from '../../../../enumeration/pathType'
import config from '../../../../config'

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
    config.postcodeLookupEnabled = false

    licenceService.updateAppointmentAddress = jest.fn()
    licenceService.recordAuditEvent = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
    config.postcodeLookupEnabled = false
  })

  describe('Hardstop licence prison user journey', () => {
    let handler = new InitialMeetingPlaceRoutes(licenceService, PathType.CREATE)

    describe('GET', () => {
      it('should render view', async () => {
        await handler.GET(req, res)
        expect(res.render).toHaveBeenCalledWith('pages/create/hardStop/initialMeetingPlace', {
          formAddress,
          continueOrSaveLabel: 'Continue',
          manualAddressEntryUrl: '/licence/hard-stop/create/id/1/manual-address-entry',
        })
      })

      it('should render view with save Label and manual address entry URL', async () => {
        handler = new InitialMeetingPlaceRoutes(licenceService, PathType.EDIT)
        await handler.GET(req, res)
        expect(res.render).toHaveBeenCalledWith('pages/create/hardStop/initialMeetingPlace', {
          formAddress,
          continueOrSaveLabel: 'Save',
          manualAddressEntryUrl: '/licence/hard-stop/edit/id/1/manual-address-entry',
        })
      })
    })

    describe('POST', () => {
      it('should redirect to the initial meeting contact page', async () => {
        handler = new InitialMeetingPlaceRoutes(licenceService, PathType.CREATE)
        await handler.POST(req, res)
        expect(licenceService.updateAppointmentAddress).toHaveBeenCalledWith(1, formAddress, { username: 'joebloggs' })
        expect(res.redirect).toHaveBeenCalledWith('/licence/hard-stop/create/id/1/initial-meeting-contact')
      })

      it('should redirect to the check your answers page page', async () => {
        handler = new InitialMeetingPlaceRoutes(licenceService, PathType.EDIT)
        req = {
          params: {
            licenceId: 1,
          },
          body: formAddress,
          query: {},
        } as unknown as Request
        await handler.POST(req, res)
        expect(licenceService.updateAppointmentAddress).toHaveBeenCalledWith(1, formAddress, { username: 'joebloggs' })
        expect(res.redirect).toHaveBeenCalledWith('/licence/hard-stop/id/1/check-your-answers')
      })

      it('should call to generate a flash message', async () => {
        await handler.POST(req, res)
        expect(flashInitialApptUpdatedMessage).toHaveBeenCalledWith(req, res.locals.licence, UserType.PRISON)
      })

      it('should not call updateAppointmentAddress', async () => {
        config.postcodeLookupEnabled = true
        await handler.POST(req, res)
        expect(licenceService.updateAppointmentAddress).not.toHaveBeenCalled()
        expect(flashInitialApptUpdatedMessage).not.toHaveBeenCalledWith()
      })

      it('should redirect to /select-address in create flow if postcode lookup is enabled and searchQuery is provided', async () => {
        const handler = new InitialMeetingPlaceRoutes(licenceService, PathType.CREATE)
        config.postcodeLookupEnabled = true
        req = {
          params: {
            licenceId: 123,
          },
          body: {
            searchQuery: 'SW1A 1AA',
          },
        } as unknown as Request

        await handler.POST(req, res)

        expect(res.redirect).toHaveBeenCalledWith(
          '/licence/hard-stop/create/id/123/select-address?searchQuery=SW1A%201AA',
        )
        expect(licenceService.updateAppointmentAddress).not.toHaveBeenCalled()
        expect(flashInitialApptUpdatedMessage).not.toHaveBeenCalled()
      })

      it('should redirect to /select-address in edit flow if postcode lookup is enabled and searchQuery is provided', async () => {
        const handler = new InitialMeetingPlaceRoutes(licenceService, PathType.EDIT)
        config.postcodeLookupEnabled = true
        req = {
          params: {
            licenceId: 123,
          },
          body: {
            searchQuery: 'SW1A 1AA',
          },
        } as unknown as Request

        await handler.POST(req, res)

        expect(res.redirect).toHaveBeenCalledWith(
          '/licence/hard-stop/edit/id/123/select-address?searchQuery=SW1A%201AA',
        )
        expect(licenceService.updateAppointmentAddress).not.toHaveBeenCalled()
        expect(flashInitialApptUpdatedMessage).not.toHaveBeenCalled()
      })
    })
  })
})
