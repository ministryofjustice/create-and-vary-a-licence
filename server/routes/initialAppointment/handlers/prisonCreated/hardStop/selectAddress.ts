import { Request, Response } from 'express'
import AddressService from '../../../../../services/addressService'
import { AddAddressRequest } from '../../../../../@types/licenceApiClientTypes'
import PathType from '../../../../../enumeration/pathType'

export default class SelectAddressRoutes {
  constructor(
    private readonly addressService: AddressService,
    private readonly path: PathType,
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { searchQuery } = req.query as { searchQuery?: string }
    const { user } = res.locals
    const action = this.path === PathType.EDIT ? 'edit' : 'create'
    const basePath = `/licence/hard-stop/${action}/id/${licenceId}`

    const addresses = await this.addressService.searchForAddresses(searchQuery, user, 'probation')

    if (!addresses.length) {
      const redirectUrl = `${basePath}/no-address-found?searchQuery=${encodeURIComponent(searchQuery)}`
      res.redirect(redirectUrl)
      return
    }

    res.render('pages/initialAppointment/prisonCreated/selectAddress', {
      addresses,
      licenceId,
      searchQuery,
      continueOrSaveLabel: this.path === PathType.EDIT ? 'Save' : 'Continue',
      postcodeLookupSearchUrl: `${basePath}/initial-meeting-place`,
      manualAddressEntryUrl: `${basePath}/manual-address-entry`,
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { user } = res.locals
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

    if (this.path === PathType.EDIT) {
      res.redirect(`/licence/hard-stop/id/${licenceId}/check-your-answers`)
    } else {
      res.redirect(`/licence/hard-stop/create/id/${licenceId}/initial-meeting-contact`)
    }
  }
}
