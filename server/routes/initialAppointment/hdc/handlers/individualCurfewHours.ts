import { Request, Response } from 'express'
import HdcService from '../../../../services/hdcService'
import { DAYS } from '../../../../enumeration/days'
import { HdcLicence } from '../../../../@types/licenceApiClientTypes'

export default class IndividualCurfewHoursRoutes {
  constructor(private readonly hdcService: HdcService) {}

  GET = async (_req: Request, res: Response): Promise<void> => {
    const { licence }: { licence: HdcLicence } = res.locals

    const curfewTimes = this.hdcService.getCurfewTimes(licence.weeklyCurfewTimes)

    res.render('pages/hdc/individualCurfewHours', { days: DAYS, curfewTimes })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licence, user } = res.locals

    const curfewTimes = req.body.curfews
    await this.hdcService.updateDifferingCurfewTimes(licence.id, curfewTimes, user)
    if (req.query?.fromReview) {
      return res.redirect(`/licence/create/id/${licence.id}/check-your-answers`)
    }
    return res.redirect(`/licence/create/id/${licence.id}/additional-licence-conditions-question`)
  }
}
