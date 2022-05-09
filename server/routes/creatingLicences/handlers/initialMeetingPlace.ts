import { Request, Response } from 'express'
import moment from 'moment'
import { isBankHolidayOrWeekend, stringToAddressObject } from '../../../utils/utils'
import LicenceService from '../../../services/licenceService'
import UkBankHolidayFeedService from '../../../services/ukBankHolidayFeedService'

export default class InitialMeetingPlaceRoutes {
  constructor(
    private readonly licenceService: LicenceService,
    private readonly ukBankHolidayFeedService: UkBankHolidayFeedService
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals

    const bankHolidays = await this.ukBankHolidayFeedService.getEnglishAndWelshHolidays()

    const formAddress = stringToAddressObject(licence.appointmentAddress)
    res.render('pages/create/initialMeetingPlace', {
      formAddress,
      releaseIsOnBankHolidayOrWeekend: isBankHolidayOrWeekend(
        moment(licence.actualReleaseDate || licence.conditionalReleaseDate, 'DD/MM/YYYY'),
        bankHolidays
      ),
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { user } = res.locals
    await this.licenceService.updateAppointmentAddress(licenceId, req.body, user)

    if (req.query?.fromReview) {
      res.redirect(`/licence/create/id/${licenceId}/check-your-answers`)
    } else {
      res.redirect(`/licence/create/id/${licenceId}/initial-meeting-contact`)
    }
  }
}
