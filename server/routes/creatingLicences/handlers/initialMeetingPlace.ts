import { Request, Response } from 'express'
import { stringToAddressObject } from '../../../utils/utils'
import LicenceService from '../../../services/licenceService'

export default class InitialMeetingPlaceRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { appointmentAddress } = res.locals.licence
    const formAddress = stringToAddressObject(appointmentAddress)
    res.render('pages/create/initialMeetingPlace', { formAddress })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { username } = res.locals.user
    await this.licenceService.updateAppointmentAddress(licenceId, req.body, username)

    if (req.query?.fromReview) {
      res.redirect(`/licence/create/id/${licenceId}/check-your-answers`)
    } else {
      res.redirect(`/licence/create/id/${licenceId}/initial-meeting-contact`)
    }
  }
}
