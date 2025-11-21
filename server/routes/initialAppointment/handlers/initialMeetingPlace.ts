import { Request, Response } from 'express'
import { stringToAddressObject } from '../../../utils/utils'
import LicenceService from '../../../services/licenceService'
import UserType from '../../../enumeration/userType'
import flashInitialApptUpdatedMessage from './initialMeetingUpdatedFlashMessage'
import config from '../../../config'
import AddressService from '../../../services/addressService'
import { AddAddressRequest, AddressResponse } from '../../../@types/licenceApiClientTypes'
import { User } from '../../../@types/CvlUserDetails'

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
    return res.render('pages/initialAppointment/initialMeetingPlace', {
      preferredAddresses,
      formAddress,
      manualAddressEntryUrl: `${basePath}/manual-address-entry${fromReviewParam}`,
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { user, licence } = res.locals
    const { searchQuery, preferredAddress } = req.body
    const fromReview = req.query?.fromReview as string
    const isPrisonUser = this.userType === UserType.PRISON
    const basePath = `/licence/${isPrisonUser ? 'view' : 'create'}/id/${licenceId}`

    if (config.postcodeLookupEnabled) {
      if (preferredAddress) {
        await this.handlePreferredAddress(licenceId, preferredAddress, user)
      } else if (searchQuery?.trim()) {
        const fromReviewParam = fromReview ? '&fromReview=true' : ''
        return res.redirect(
          `${basePath}/select-address?searchQuery=${encodeURIComponent(searchQuery)}${fromReviewParam}`,
        )
      }
    } else {
      await this.licenceService.updateAppointmentAddress(licenceId, req.body, user)
      flashInitialApptUpdatedMessage(req, licence, this.userType)
    }

    return res.redirect(this.getRedirectPath(licenceId, isPrisonUser, fromReview))
  }

  private async handlePreferredAddress(licenceId: string, preferredAddressJson: string, user: User): Promise<void> {
    const { uprn, firstLine, secondLine, townOrCity, county, postcode, source } = JSON.parse(preferredAddressJson)

    const appointmentAddress: AddAddressRequest = {
      uprn,
      firstLine,
      secondLine,
      townOrCity,
      county,
      postcode,
      source,
      isPreferredAddress: false,
    }

    await this.addressService.addAppointmentAddress(licenceId, appointmentAddress, user)
  }

  private getRedirectPath(licenceId: string, isPrisonUser: boolean, fromReview?: string): string {
    const basePath = `/licence/create/id/${licenceId}`

    if (isPrisonUser) {
      return `/licence/view/id/${licenceId}/show`
    }

    if (fromReview) {
      return `${basePath}/check-your-answers`
    }

    return `${basePath}/initial-meeting-contact`
  }
}
