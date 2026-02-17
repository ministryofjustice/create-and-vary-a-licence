import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import YesOrNo from '../../../enumeration/yesOrNo'

export default class StandardCurfewHoursQuestionRoutes {
  constructor() {}

  GET = async (req: Request, res: Response): Promise<void> => {
    res.render('pages/hdc/standardCurfewHoursQuestion')
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { answer } = req.body
    if (answer === YesOrNo.YES) {
      return res.redirect(`/licence/create/id/${licenceId}/additional-licence-conditions-question`)
    }
    return res.redirect(`/licence/create/id/${licenceId}/do-hdc-curfew-hours-apply-daily`)
  }
}
