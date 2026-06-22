import { Request, Response } from 'express'
import YesOrNo from '../../../../enumeration/yesOrNo'
import HdcService from '../../../../services/hdc/hdcService'
import { STANDARD_WEEKLY_CURFEW_TIMES } from '../../../../utils/curfewDefaults'

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

      res.redirect(`/licence/create/id/${licence.id}/check-your-answers`)
      return
    }

    const query = fromReview ? '?fromReview=true' : ''
    res.redirect(`/licence/vary/id/${licence.id}/hdc/do-hdc-curfew-hours-apply-daily${query}`)
  }
}
