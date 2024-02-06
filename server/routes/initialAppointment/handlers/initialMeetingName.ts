import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import UserType from '../../../enumeration/userType'
import LicenceKind from '../../../enumeration/LicenceKind'

export default class InitialMeetingNameRoutes {
  constructor(
    private readonly licenceService: LicenceService,
    private readonly userType: UserType
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals

    // Prison should only be able to access this page in hard stop, and probation should only be able to access
    // outside of hard stop
    if (licence.kind !== LicenceKind.VARIATION) {
      if (!licence.isInHardStopPeriod && this.userType === UserType.PRISON) {
        return res.redirect('/access-denied')
      }
      if (licence.isInHardStopPeriod && this.userType === UserType.PROBATION) {
        return res.redirect('/access-denied')
      }
    }

    return res.render('pages/create/initialMeetingPerson', {
      releaseIsOnBankHolidayOrWeekend: licence.isEligibleForEarlyRelease,
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { user } = res.locals
    await this.licenceService.updateAppointmentPerson(licenceId, req.body, user)

    if (this.userType === UserType.PRISON) {
      res.redirect(`/licence/view/id/${licenceId}/show`)
    } else if (req.query?.fromReview) {
      res.redirect(`/licence/create/id/${licenceId}/check-your-answers`)
    } else {
      res.redirect(`/licence/create/id/${licenceId}/initial-meeting-place`)
    }
  }
}
