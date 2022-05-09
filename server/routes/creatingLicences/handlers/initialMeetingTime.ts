import { Request, Response } from 'express'
import moment from 'moment'
import LicenceService from '../../../services/licenceService'
import { isBankHolidayOrWeekend, jsonToSimpleDateTime } from '../../../utils/utils'
import LicenceType from '../../../enumeration/licenceType'
import UkBankHolidayFeedService from '../../../services/ukBankHolidayFeedService'

export default class InitialMeetingTimeRoutes {
  constructor(
    private readonly licenceService: LicenceService,
    private readonly ukBankHolidayFeedService: UkBankHolidayFeedService
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals

    const bankHolidays = await this.ukBankHolidayFeedService.getEnglishAndWelshHolidays()

    const formDate = jsonToSimpleDateTime(licence.appointmentTime)
    res.render('pages/create/initialMeetingTime', {
      formDate,
      releaseIsOnBankHolidayOrWeekend: isBankHolidayOrWeekend(
        moment(licence.actualReleaseDate || licence.conditionalReleaseDate, 'DD/MM/YYYY'),
        bankHolidays
      ),
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { licence } = res.locals
    const { user } = res.locals

    await this.licenceService.updateAppointmentTime(licenceId, req.body, user)

    if (req.query?.fromReview) {
      return res.redirect(`/licence/create/id/${licenceId}/check-your-answers`)
    }

    if (licence.typeCode === LicenceType.AP || licence.typeCode === LicenceType.AP_PSS) {
      return res.redirect(`/licence/create/id/${licenceId}/additional-licence-conditions-question`)
    }

    return res.redirect(`/licence/create/id/${licenceId}/additional-pss-conditions-question`)
  }
}
