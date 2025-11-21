import { Request, Response } from 'express'
import { stringToAddressObject } from '../../../../utils/utils'
import LicenceService from '../../../../services/licenceService'
import PathType from '../../../../enumeration/pathType'
import config from '../../../../config'
import { AddressResponse } from '../../../../@types/licenceApiClientTypes'
import AddressService from '../../../../services/addressService'

export default class InitialMeetingPlaceRoutes {
  constructor(
    private readonly licenceService: LicenceService,
    private readonly addressService: AddressService,
    private readonly path: PathType,
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals

    const formAddress = stringToAddressObject(licence.appointmentAddress)
    let preferredAddresses: AddressResponse[] = []
    if (config.postcodeLookupEnabled) {
      preferredAddresses = await this.addressService.getPreferredAddresses(res.locals.user)
    }
    return res.render('pages/initialAppointment/prisonCreated/initialMeetingPlace', {
      preferredAddresses,
      formAddress,
      continueOrSaveLabel: 'Continue',
      manualAddressEntryUrl: '/licence/view/cases',
    })
  }
}
