import { Request, Response } from 'express'
import YesOrNo from '../../../enumeration/yesOrNo'
import HdcService from '../../../services/hdcService'
import STANDARD_CURFEW_TIMES from '../curfewDefaults'

export default class StandardCurfewHoursQuestionRoutes {
  constructor(private readonly hdcService: HdcService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    res.render('pages/hdc/standardCurfewHoursQuestion')
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licence, user } = res.locals
    const { answer } = req.body
    if (answer === YesOrNo.YES) {
      await this.hdcService.updateCurfewTimes(licence.id, STANDARD_CURFEW_TIMES, user)
      return res.redirect(`/licence/create/id/${licence.id}/additional-licence-conditions-question`)
    }
    return res.redirect(`/licence/create/id/${licence.id}/hdc/do-hdc-curfew-hours-apply-daily`)
  }
}
