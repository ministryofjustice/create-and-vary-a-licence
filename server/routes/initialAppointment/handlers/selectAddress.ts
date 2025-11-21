import { Request, Response } from 'express'
import AddressService from '../../../services/addressService'
import UserType from '../../../enumeration/userType'
import { AddAddressRequest } from '../../../@types/licenceApiClientTypes'

export default class SelectAddressRoutes {
  constructor(
    private readonly addressService: AddressService,
    private readonly userType: UserType,
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { searchQuery } = req.query as { searchQuery?: string }
    const { user } = res.locals
    const fromReview = req.query?.fromReview
    const fromReviewParam = fromReview ? '?fromReview=true' : ''

    const addresses = await this.addressService.searchForAddresses(searchQuery, user, 'probation')

    if (!addresses.length) {
      const redirectUrl = `/licence/create/id/${licenceId}/no-address-found?searchQuery=${encodeURIComponent(searchQuery)}`
      res.redirect(redirectUrl)
      return
    }

    res.render('pages/initialAppointment/selectAddress', {
      addresses,
      licenceId,
      searchQuery,
      postcodeLookupSearchUrl: `/licence/create/id/${licenceId}/initial-meeting-place${fromReviewParam}`,
      manualAddressEntryUrl: `/licence/create/id/${licenceId}/manual-address-entry${fromReviewParam}`,
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { user } = res.locals
    const basePath = `/licence/create/id/${licenceId}`
    const { isPreferredAddress } = req.body

    const { uprn, firstLine, secondLine, townOrCity, county, postcode } = JSON.parse(req.body?.selectedAddress)

    const appointmentAddress = {
      uprn,
      firstLine,
      secondLine,
      townOrCity,
      county,
      postcode,
      source: 'OS_PLACES',
      isPreferredAddress: isPreferredAddress === 'true',
    } as AddAddressRequest

    await this.addressService.addAppointmentAddress(licenceId, appointmentAddress, user)

    if (this.userType === UserType.PRISON) {
      res.redirect(`/licence/view/id/${licenceId}/show`)
    } else if (req.query?.fromReview) {
      res.redirect(`${basePath}/check-your-answers`)
    } else {
      res.redirect(`${basePath}/initial-meeting-contact`)
    }
  }
}
