import { Request, Response } from 'express'
import AddressService from '../../../services/addressService'
import UserType from '../../../enumeration/userType'

export default class SelectAddressRoutes {
  constructor(
    private readonly addressService: AddressService,
    private readonly userType: UserType,
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { searchQuery } = req.query as { searchQuery?: string }
    const { user } = res.locals

    const addresses = await this.addressService.searchForAddresses(searchQuery, user)

    if (!addresses.length) {
      const redirectUrl = `/licence/create/id/${licenceId}/no-address-found?searchQuery=${encodeURIComponent(searchQuery)}`
      res.redirect(redirectUrl)
      return
    }

    res.render('pages/create/selectAddress', {
      addresses,
      licenceId,
      searchQuery,
      postcodeLookupSearchUrl: `/licence/create/id/${licenceId}/initial-meeting-place`,
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const basePath = `/licence/create/id/${licenceId}`
    if (this.userType === UserType.PRISON) {
      res.redirect(`/licence/view/id/${licenceId}/show`)
    } else if (req.query?.fromReview) {
      res.redirect(`${basePath}/check-your-answers`)
    } else {
      res.redirect(`${basePath}/initial-meeting-contact`)
    }
  }
}
