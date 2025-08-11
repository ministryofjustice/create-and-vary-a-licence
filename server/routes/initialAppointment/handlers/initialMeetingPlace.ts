import { Request, Response } from 'express'
import { stringToAddressObject } from '../../../utils/utils'
import LicenceService from '../../../services/licenceService'
import UserType from '../../../enumeration/userType'
import flashInitialApptUpdatedMessage from './initialMeetingUpdatedFlashMessage'
import config from '../../../config'
import AddressService from '../../../services/addressService'
import { AddAddressRequest, AddressResponse } from '../../../@types/licenceApiClientTypes'

export default class InitialMeetingPlaceRoutes {
  constructor(
    private readonly licenceService: LicenceService,
    private readonly addressService: AddressService,
    private readonly userType: UserType,
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { licence } = res.locals
    const basePath = `/licence/create/id/${licenceId}`
    const fromReview = req.query?.fromReview
    const fromReviewParam = fromReview ? '?fromReview=true' : ''
    const formAddress = stringToAddressObject(licence.appointmentAddress)
    let preferredAddresses: AddressResponse[] = []
    if (config.postcodeLookupEnabled) {
      preferredAddresses = await this.addressService.getPreferredAddresses(res.locals.user)
    }
    return res.render('pages/create/initialMeetingPlace', {
      preferredAddresses,
      formAddress,
      manualAddressEntryUrl: `${basePath}/manual-address-entry${fromReviewParam}`,
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { user, licence } = res.locals
    const { searchQuery } = req.body
    const fromReview = req.query?.fromReview
    const isPrisonUser = this.userType === UserType.PRISON

    if (config.postcodeLookupEnabled && req.body?.preferredAddress) {
      const { uprn, firstLine, secondLine, townOrCity, county, postcode, source } = JSON.parse(
        req.body?.preferredAddress,
      )

      const appointmentAddress = {
        uprn,
        firstLine,
        secondLine,
        townOrCity,
        county,
        postcode,
        source,
        isPreferredAddress: false,
      } as AddAddressRequest

      await this.addressService.addAppointmentAddress(licenceId, appointmentAddress, user)
    } else if (config.postcodeLookupEnabled && searchQuery?.trim()) {
      const basePath = `/licence/${isPrisonUser ? 'view' : 'create'}/id/${licenceId}`
      const fromReviewParam = fromReview ? '&fromReview=true' : ''
      return res.redirect(`${basePath}/select-address?searchQuery=${encodeURIComponent(searchQuery)}${fromReviewParam}`)
    }

    if (!config.postcodeLookupEnabled) {
      await this.licenceService.updateAppointmentAddress(licenceId, req.body, user)
      flashInitialApptUpdatedMessage(req, licence, this.userType)
    }

    let redirectPath: string
    const basePath = `/licence/create/id/${licenceId}`

    if (isPrisonUser) {
      redirectPath = `/licence/view/id/${licenceId}/show`
    } else if (fromReview) {
      redirectPath = `${basePath}/check-your-answers`
    } else {
      redirectPath = `${basePath}/initial-meeting-contact`
    }

    return res.redirect(redirectPath)
  }
}
