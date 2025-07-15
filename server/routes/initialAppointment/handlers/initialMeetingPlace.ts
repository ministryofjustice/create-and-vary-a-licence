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
    const { licence } = res.locals

    const formAddress = stringToAddressObject(licence.appointmentAddress)
    return res.render('pages/create/initialMeetingPlace', {
      formAddress,
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { user, licence } = res.locals
    const basePath = `/licence/create/id/${licenceId}`

    if (config.postcodeLookupEnabled) {
      const { searchQuery } = req.body
      if (searchQuery.trim().length > 0) {
        res.redirect(`${basePath}/select-address?searchQuery=${encodeURIComponent(searchQuery)}`)
      }
      return
    }

    await this.licenceService.updateAppointmentAddress(licenceId, req.body, user)
    flashInitialApptUpdatedMessage(req, licence, this.userType)

    if (this.userType === UserType.PRISON) {
      res.redirect(`/licence/view/id/${licenceId}/show`)
    } else if (req.query?.fromReview) {
      res.redirect(`${basePath}/check-your-answers`)
    } else {
      res.redirect(`${basePath}/initial-meeting-contact`)
    }
  }
}
