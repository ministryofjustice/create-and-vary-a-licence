import { Request, Response } from 'express'
import YesOrNo from '../../../enumeration/yesOrNo'
import LicenceService from '../../../services/licenceService'
import { getStandardHdcCurfewTimes } from '../../../utils/utils'

export default class StandardCurfewHoursQuestionRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    res.render('pages/hdc/standardCurfewHoursQuestion')
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licence, user } = res.locals
    const { answer } = req.body
    if (answer === YesOrNo.YES) {
      await this.licenceService.updateCurfewTimes(licence.id, getStandardHdcCurfewTimes(), user)
      return res.redirect(`/licence/create/id/${licence.id}/additional-licence-conditions-question`)
    }
    return res.redirect(`/licence/create/id/${licence.id}/do-hdc-curfew-hours-apply-daily`)
  }
}
