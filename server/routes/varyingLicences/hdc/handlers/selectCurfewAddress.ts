import { Request, Response } from 'express'
import { LicenceIdParams } from '../../../types/routeParams'
import AddressService from '../../../../services/addressService'
import HdcCurfewAddressService from '../../../../services/hdc/hdcCurfewAddressService'
import { AddAddressRequest, AddHdcCurfewAddressRequest } from '../../../../@types/licenceApiClientTypes'

export default class SelectCurfewAddressRoutes {
  constructor(
    private readonly addressService: AddressService,
    private readonly hdcCurfewAddressService: HdcCurfewAddressService,
  ) {}

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

  POST = async (req: Request<LicenceIdParams>, res: Response): Promise<void> => {
    const { licenceId } = req.params

    const { uprn, firstLine, secondLine, townOrCity, county, postcode } = JSON.parse(req.body?.selectedCurfewAddress)

    const address = {
      uprn,
      firstLine,
      secondLine,
      townOrCity,
      county,
      postcode,
      source: 'OS_PLACES',
    } as AddAddressRequest

    const addHdcCurfewAddressRequest = {
      address,
      accommodationType: req.session.curfewAccommodationType,
      postReleaseResidentialChecksCompleted: req.session.curfewAddressChecksCompleted,
      postReleaseResidentialChecksNotCompletedReason: req.session.curfewAddressChecksIncompleteReason,
    } as AddHdcCurfewAddressRequest

    await this.hdcCurfewAddressService.updateHdcCurfewAddress(
      parseInt(licenceId, 10),
      addHdcCurfewAddressRequest,
      res.locals.user,
    )

    return res.redirect(`/licence/create/id/${licenceId}/check-your-answers`)
  }
}
