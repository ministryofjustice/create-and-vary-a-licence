import { Request, Response } from 'express'
import { stringToAddressObject } from '../../../utils/utils'
import LicenceService from '../../../services/licenceService'
import UserType from '../../../enumeration/userType'
import LicenceKind from '../../../enumeration/LicenceKind'

export default class InitialMeetingPlaceRoutes {
  constructor(
    private readonly licenceService: LicenceService,
    private readonly userType: UserType
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals

    const formAddress = stringToAddressObject(licence.appointmentAddress)
    return res.render('pages/create/initialMeetingPlace', {
      formAddress,
      releaseIsOnBankHolidayOrWeekend: licence.isEligibleForEarlyRelease,
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { user } = res.locals
    await this.licenceService.updateAppointmentAddress(licenceId, req.body, user)

    if (this.userType === UserType.PRISON) {
      res.redirect(`/licence/view/id/${licenceId}/show`)
    } else if (req.query?.fromReview) {
      res.redirect(`/licence/create/id/${licenceId}/check-your-answers`)
    } else {
      res.redirect(`/licence/create/id/${licenceId}/initial-meeting-contact`)
    }
  }
}
