import { Request, Response } from 'express'
import PathType from '../../../../../enumeration/pathType'
import AddressService from '../../../../../services/addressService'
import ManualAddressPostcodeLookupRoutes from './manualAddressPostcodeLookup'
import flashInitialApptUpdatedMessage from '../../initialMeetingUpdatedFlashMessage'
import UserType from '../../../../../enumeration/userType'

const addressService = new AddressService(null) as jest.Mocked<AddressService>
jest.mock('../../initialMeetingUpdatedFlashMessage')

describe('Route Handlers - Create a licence - Manual address entry', () => {
  let req: Request
  let res: Response

  describe('TimeServed licence prison user journey', () => {
    beforeEach(() => {
      req = {
        params: { licenceId: 1 },
        body: {},
        query: {},
      } as unknown as Request

      res = {
        render: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user: { username: 'joebloggs' },
          licence: { id: 123 },
        },
      } as unknown as Response
    })

    describe('GET', () => {
      it('should render the manual address postcode lookup form with "Continue" button in create flow', async () => {
        // Given
        const handler = new ManualAddressPostcodeLookupRoutes(addressService, PathType.CREATE)

        // When
        await handler.GET(req, res)

        // Then
        expect(res.render).toHaveBeenCalledWith(
          'pages/initialAppointment/prisonCreated/manualAddressPostcodeLookupForm',
          {
            continueOrSaveLabel: 'Continue',
            postcodeLookupUrl: `/licence/time-served/create/id/${req.params.licenceId}/initial-meeting-place`,
          },
        )
      })

      it('should render the manual address postcode lookup form with "Save" button in edit flow', async () => {
        // Given
        const handler = new ManualAddressPostcodeLookupRoutes(addressService, PathType.EDIT)

        // When
        await handler.GET(req, res)

        // Then
        expect(res.render).toHaveBeenCalledWith(
          'pages/initialAppointment/prisonCreated/manualAddressPostcodeLookupForm',
          {
            continueOrSaveLabel: 'Save',
            postcodeLookupUrl: `/licence/time-served/edit/id/${req.params.licenceId}/initial-meeting-place`,
          },
        )
      })
    })

    describe('POST /manual-address', () => {
      const licenceId = '123'
      const user = { username: 'joebloggs' }

      beforeEach(() => {
        req.params.licenceId = licenceId
        req.body = {
          firstLine: '123 Test Street',
          secondLine: 'Flat 4B',
          townOrCity: 'Testville',
          county: 'Testshire',
          postcode: 'TE5 7ST',
          isPreferredAddress: '',
        }
        addressService.addAppointmentAddress = jest.fn()
        res.locals.licence = { id: licenceId }
      })

      it('should call addAppointmentAddress with correct data and redirect to initial meeting contact in create flow', async () => {
        // Given
        const handler = new ManualAddressPostcodeLookupRoutes(addressService, PathType.CREATE)

        // When
        await handler.POST(req, res)

        // Then
        expect(addressService.addAppointmentAddress).toHaveBeenCalledWith(
          licenceId,
          {
            ...req.body,
            isPreferredAddress: false,
            source: 'MANUAL',
          },
          user,
        )
        expect(flashInitialApptUpdatedMessage).toHaveBeenCalledWith(req, res.locals.licence, UserType.PRISON)
        expect(res.redirect).toHaveBeenCalledWith(`/licence/time-served/create/id/${licenceId}/initial-meeting-contact`)
      })

      it('should call addAppointmentAddress and redirect correctly in edit flow', async () => {
        // Given
        const handler = new ManualAddressPostcodeLookupRoutes(addressService, PathType.EDIT)
        req.body.isPreferredAddress = 'true'

        // When
        await handler.POST(req, res)

        // Then
        expect(addressService.addAppointmentAddress).toHaveBeenCalledWith(
          licenceId,
          {
            ...req.body,
            isPreferredAddress: true,
            source: 'MANUAL',
          },
          user,
        )
        expect(flashInitialApptUpdatedMessage).toHaveBeenCalledWith(req, res.locals.licence, UserType.PRISON)
        expect(res.redirect).toHaveBeenCalledWith(`/licence/time-served/id/123/check-your-answers`)
      })
    })
  })
})
