import { Request, Response } from 'express'
import moment from 'moment'
import LicenceService from '../../../services/licenceService'
import { isBankHolidayOrWeekend } from '../../../utils/utils'
import UkBankHolidayFeedService from '../../../services/ukBankHolidayFeedService'

export default class InitialMeetingNameRoutes {
  constructor(
    private readonly licenceService: LicenceService,
    private readonly ukBankHolidayFeedService: UkBankHolidayFeedService
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals

    const bankHolidays = await this.ukBankHolidayFeedService.getEnglishAndWelshHolidays()

    res.render('pages/create/initialMeetingPerson', {
      releaseIsOnBankHolidayOrWeekend: isBankHolidayOrWeekend(
        moment(licence.actualReleaseDate || licence.conditionalReleaseDate, 'DD/MM/YYYY'),
        bankHolidays
      ),
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { user } = res.locals
    await this.licenceService.updateAppointmentPerson(licenceId, req.body, user)

    if (req.query?.fromReview) {
      res.redirect(`/licence/create/id/${licenceId}/check-your-answers`)
    } else {
      res.redirect(`/licence/create/id/${licenceId}/initial-meeting-place`)
    }
  }
}
