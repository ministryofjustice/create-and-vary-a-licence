import { Request, Response } from 'express'
import YesOrNo from '../../../../enumeration/yesOrNo'
import HdcService from '../../../../services/hdcService'
import { STANDARD_WEEKLY_CURFEW_TIMES } from '../curfewDefaults'

export default class StandardCurfewHoursQuestionRoutes {
  constructor(private readonly hdcService: HdcService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    res.render('pages/hdc/standardCurfewHoursQuestion')
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licence, user } = res.locals
    const { answer } = req.body
    const fromReview = Boolean(req.query?.fromReview)

    if (answer === YesOrNo.YES) {
      await this.hdcService.updateWeeklyCurfewTimes(licence.id, STANDARD_WEEKLY_CURFEW_TIMES, user)

      const successRedirect = fromReview
        ? `/licence/create/id/${licence.id}/check-your-answers`
        : `/licence/create/id/${licence.id}/additional-licence-conditions-question`

      return res.redirect(successRedirect)
    }

    const noRedirect = fromReview
      ? `/licence/create/id/${licence.id}/hdc/do-hdc-curfew-hours-apply-daily?fromReview=true`
      : `/licence/create/id/${licence.id}/hdc/do-hdc-curfew-hours-apply-daily`

    return res.redirect(noRedirect)
  }
}
