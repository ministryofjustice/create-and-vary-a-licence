import { Request, Response } from 'express'
import { stringToAddressObject } from '../../../../../utils/utils'
import LicenceService from '../../../../../services/licenceService'
import PathType from '../../../../../enumeration/pathType'
import { AddAddressRequest, AddressResponse } from '../../../../../@types/licenceApiClientTypes'
import AddressService from '../../../../../services/addressService'
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
    const basePath = `/licence/hard-stop/${action}/id/${licenceId}`
    const noAppointmentNeeded = licence.appointmentPersonType === 'NO_APPOINTMENT_NEEDED'

    const formAddress = stringToAddressObject(licence.appointmentAddress)
    const preferredAddresses: AddressResponse[] = await this.addressService.getPreferredAddresses(res.locals.user)
    return res.render('pages/initialAppointment/prisonCreated/initialMeetingPlace', {
      action,
      preferredAddresses,
      formAddress,
      continueOrSaveLabel: this.path === PathType.EDIT ? 'Save' : 'Continue',
      manualAddressEntryUrl: `${basePath}/manual-address-entry`,
      addressRemovedMessage: req.flash('addressRemovedMessage')?.[0],
      noAppointmentNeeded,
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { user, licence } = res.locals
    const { searchQuery, preferredAddress } = req.body
    const action = this.path === PathType.EDIT ? 'edit' : 'create'
    const basePath = `/licence/hard-stop/${action}/id/${licenceId}`
    const noAppointmentNeeded = licence.appointmentPersonType === 'NO_APPOINTMENT_NEEDED'

    if (preferredAddress) {
      await this.handlePreferredAddress(licenceId, preferredAddress, user)
    } else if (searchQuery?.trim()) {
      return res.redirect(`${basePath}/select-address?searchQuery=${encodeURIComponent(searchQuery)}`)
    }

    return res.redirect(this.getRedirectPath(licenceId, noAppointmentNeeded))
  }

  private async handlePreferredAddress(licenceId: string, preferredAddressJson: string, user: User): Promise<void> {
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

    await this.addressService.addAppointmentAddress(licenceId, appointmentAddress, user)
  }

  private getRedirectPath(licenceId: string, noAppointmentNeeded: boolean): string {
    if (this.path === PathType.EDIT) {
      return `/licence/hard-stop/id/${licenceId}/check-your-answers`
    }
    if (noAppointmentNeeded) {
      return `/licence/hard-stop/create/id/${licenceId}/licence-contact-number`
    }
    return `/licence/hard-stop/create/id/${licenceId}/initial-meeting-contact`
  }
}
