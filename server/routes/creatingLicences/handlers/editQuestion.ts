import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import LicenceStatus from '../../../enumeration/licenceStatus'
import YesOrNo from '../../../enumeration/yesOrNo'

export default class EditQuestionRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { statusCode } = res.locals.licence
    const { licenceId } = req.params
    if (![LicenceStatus.APPROVED, LicenceStatus.SUBMITTED, LicenceStatus.REJECTED].includes(statusCode)) {
      return res.redirect(`/licence/create/id/${licenceId}/check-your-answers`)
    }
    return res.render('pages/create/editQuestion')
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { user, licence } = res.locals
    const { answer } = req.body
    if (answer === YesOrNo.YES) {
      await this.licenceService.updateStatus(licenceId, LicenceStatus.IN_PROGRESS, user)
    }
    return res.redirect(`/licence/create/id/${licenceId}/check-your-answers`)
  }
}
