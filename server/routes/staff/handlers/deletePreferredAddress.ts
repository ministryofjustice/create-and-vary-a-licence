import { Request, Response } from 'express'
import AddressService from '../../../services/addressService'
import { LicenceIdParams, ReferenceParams } from '../../types/routeParams'

export default class DeletePreferredAddressRoutes {
  constructor(private readonly addressService: AddressService) {}

  DELETE = async (req: Request<LicenceIdParams & ReferenceParams>, res: Response): Promise<void> => {
    const { reference, licenceId } = req.params
    const { user } = res.locals
    await this.addressService.deleteAddressByReference(reference, user)
    req.flash('addressRemovedMessage', 'Address removed')
    res.redirect(`/licence/create/id/${licenceId}/initial-meeting-place`)
  }
}
