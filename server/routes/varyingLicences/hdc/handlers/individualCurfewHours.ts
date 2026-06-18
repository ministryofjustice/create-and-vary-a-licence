import { Request, Response } from 'express'
import HdcService from '../../../../services/hdc/hdcService'
import { DAYS } from '../../../../enumeration/days'
import { assertIsHdcLicence } from '../../../../utils/utils'

export default class IndividualCurfewHoursRoutes {
  constructor(private readonly hdcService: HdcService) {}

  GET = async (_req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals

    assertIsHdcLicence(licence)

    const curfewTimes = this.hdcService.getCurfewTimes(licence.weeklyCurfewTimes)

    res.render('pages/hdc/individualCurfewHours', { days: DAYS, curfewTimes })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licence, user } = res.locals
    const { curfews } = req.body

    await this.hdcService.updateDifferingCurfewTimes(licence.id, curfews, user)

    res.redirect(`/licence/create/id/${licence.id}/check-your-answers`)
  }
}
