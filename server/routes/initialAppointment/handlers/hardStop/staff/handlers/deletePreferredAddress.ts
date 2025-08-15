import { Request, Response } from 'express'
import AddressService from '../../../../../../services/addressService'

export default class DeletePreferredAddressRoutes {
  constructor(private readonly addressService: AddressService) {}

  DELETE = async (req: Request, res: Response): Promise<void> => {
    const { reference, licenceId } = req.params
    const { user } = res.locals
    await this.addressService.deleteAddressByReference(reference, user)
    res.redirect(`/licence/create/hardStop/id/${licenceId}/initial-meeting-place`)
  }
}
