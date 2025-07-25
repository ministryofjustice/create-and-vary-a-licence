import { Request, Response } from 'express'
import { stringToAddressObject } from '../../../utils/utils'
import LicenceService from '../../../services/licenceService'
import UserType from '../../../enumeration/userType'
import flashInitialApptUpdatedMessage from './initialMeetingUpdatedFlashMessage'
import config from '../../../config'

export default class InitialMeetingPlaceRoutes {
  constructor(
    private readonly licenceService: LicenceService,
    private readonly userType: UserType,
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { licence } = res.locals
    const basePath = `/licence/create/id/${licenceId}`
    const fromReview = req.query?.fromReview
    const fromReviewParam = fromReview ? '?fromReview=true' : ''

    const formAddress = stringToAddressObject(licence.appointmentAddress)
    return res.render('pages/create/initialMeetingPlace', {
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

    if (config.postcodeLookupEnabled && searchQuery?.trim()) {
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
