import { Request, Response } from 'express'
import { stringToAddressObject } from '../../../../../utils/utils'
import LicenceService from '../../../../../services/licenceService'
import PathType from '../../../../../enumeration/pathType'
import config from '../../../../../config'
import { AddAddressRequest, AddressResponse, Licence } from '../../../../../@types/licenceApiClientTypes'
import AddressService from '../../../../../services/addressService'
import flashInitialApptUpdatedMessage from '../../initialMeetingUpdatedFlashMessage'
import UserType from '../../../../../enumeration/userType'
import { getTimeServedEditPath } from './index'
import { User } from '../../../../../@types/CvlUserDetails'

export default class InitialMeetingPlaceRoutes {
  constructor(
    private readonly licenceService: LicenceService,
    private readonly addressService: AddressService,
    private readonly path: PathType,
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals
    const { licenceId } = req.params
    const action = this.path === PathType.EDIT ? 'edit' : 'create'
    const basePath = `/licence/time-served/${action}/id/${licenceId}`

    const formAddress = stringToAddressObject(licence.appointmentAddress)
    let preferredAddresses: AddressResponse[] = []
    if (config.postcodeLookupEnabled) {
      preferredAddresses = await this.addressService.getPreferredAddresses(res.locals.user)
    }
    return res.render('pages/initialAppointment/prisonCreated/initialMeetingPlace', {
      action,
      preferredAddresses,
      formAddress,
      continueOrSaveLabel: this.path === PathType.EDIT ? 'Save' : 'Continue',
      manualAddressEntryUrl: `${basePath}/manual-address-entry`,
      addressRemoved: req.flash('addressRemoved')?.[0],
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { user, licence } = res.locals
    const { searchQuery, preferredAddress } = req.body
    const action = this.path === PathType.EDIT ? 'edit' : 'create'
    const basePath = `/licence/time-served/${action}/id/${licenceId}`

    if (config.postcodeLookupEnabled) {
      if (preferredAddress) {
        await this.handlePreferredAddress(licence, preferredAddress, user)
      } else if (searchQuery?.trim()) {
        return res.redirect(`${basePath}/select-address?searchQuery=${encodeURIComponent(searchQuery)}`)
      }
    } else {
      await this.licenceService.updateAppointmentAddress(licenceId, req.body, user)
      flashInitialApptUpdatedMessage(req, licence, UserType.PRISON)
    }

    return res.redirect(this.getRedirectPath(licence))
  }

  private async handlePreferredAddress(licence: Licence, preferredAddressJson: string, user: User): Promise<void> {
    const parsed = JSON.parse(preferredAddressJson)

    const appointmentAddress: AddAddressRequest = {
      uprn: parsed.uprn,
      firstLine: parsed.firstLine,
      secondLine: parsed.secondLine,
      townOrCity: parsed.townOrCity,
      county: parsed.county,
      postcode: parsed.postcode,
      source: parsed.source,
      isPreferredAddress: false,
    }
    await this.addressService.addAppointmentAddress(licence.id, appointmentAddress, user)
  }

  private getRedirectPath(licence: Licence): string {
    if (this.path === PathType.EDIT) {
      return getTimeServedEditPath(licence)
    }
    return `/licence/time-served/create/id/${licence.id}/initial-meeting-contact`
  }
}
