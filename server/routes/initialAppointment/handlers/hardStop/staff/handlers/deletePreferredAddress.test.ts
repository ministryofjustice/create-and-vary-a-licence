import { Request, Response } from 'express'
import DeletePreferredAddressRoutes from './deletePreferredAddress'
import AddressService from '../../../../../../services/addressService'

const addressService = new AddressService(null) as jest.Mocked<AddressService>

describe('Route Handlers - Create a licence - Select an address', () => {
  let req: Request
  let res: Response
  describe('DELETE', () => {
    beforeEach(() => {
      req = {
        params: {
          licenceId: 123,
          reference: '550e8400-e29b-41d4-a716-446655440000',
        },
        body: {},
        query: {
          PathType: 'create',
        },
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
      addressService.deleteAddressByReference = jest.fn()
      addressService.addAppointmentAddress = jest.fn()
    })
    it('should delete address by reference and redirect to initial meeting place with create pathType', async () => {
      const handler = new DeletePreferredAddressRoutes(addressService)
      await handler.DELETE(req, res)

      expect(addressService.deleteAddressByReference).toHaveBeenCalledWith(req.params.reference, res.locals.user)
      expect(res.redirect).toHaveBeenCalledWith(
        `/licence/hardStop/create/id/${req.params.licenceId}/initial-meeting-place`,
      )
    })

    it('should delete address by reference and redirect to initial meeting place with edit pathType', async () => {
      const handler = new DeletePreferredAddressRoutes(addressService)
      req.query.pathType = 'edit'
      await handler.DELETE(req, res)

      expect(addressService.deleteAddressByReference).toHaveBeenCalledWith(req.params.reference, res.locals.user)
      expect(res.redirect).toHaveBeenCalledWith(
        `/licence/hardStop/edit/id/${req.params.licenceId}/initial-meeting-place`,
      )
    })
  })
})
