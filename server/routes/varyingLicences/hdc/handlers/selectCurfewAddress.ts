import { Request, Response } from 'express'
import AddressService from '../../../../services/addressService'

export default class SelectCurfewAddressRoutes {
  constructor(private readonly addressService: AddressService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { searchQuery } = req.query as { searchQuery?: string }
    const { user } = res.locals
    const basePath = `/licence/vary/id/${licenceId}/hdc`

    const addresses = await this.addressService.searchForAddresses(searchQuery, user, 'probation')

    if (!addresses.length) {
      const redirectUrl = `${basePath}/no-curfew-address-found?searchQuery=${encodeURIComponent(searchQuery)}`
      res.redirect(redirectUrl)
      return
    }

    res.render('pages/vary/hdc/selectCurfewAddress', {
      addresses,
      licenceId,
      searchQuery,
      postcodeLookupSearchUrl: `${basePath}/find-the-new-curfew-address`,
      manualAddressEntryUrl: `${basePath}/manual-curfew-address-entry`,
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params

    return res.redirect(`/licence/vary/id/${licenceId}/view-active`)
  }
}
