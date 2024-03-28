import { Request, Response } from 'express'
import YesOrNo from '../../../../enumeration/yesOrNo'
import LicenceService from '../../../../services/licenceService'
import LicenceKind from '../../../../enumeration/LicenceKind'

export default class ConfirmCreateRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { nomisId } = req.params
    const { user } = res.locals
    const {
      cvl: { licenceType },
    } = await this.licenceService.getPrisonerDetail(nomisId, user)
    return res.render('pages/create/hardStop/confirmCreate', { licenceType })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { nomisId } = req.params
    const { user } = res.locals
    const { answer } = req.body
    const backLink = req.session.returnToCase

    if (answer === YesOrNo.YES) {
      const { licenceId } = await this.licenceService.createLicence(
        { nomsId: nomisId, type: LicenceKind.HARD_STOP },
        user
      )
      return res.redirect(`/licence/hard-stop/create/id/${licenceId}/initial-meeting-name`)
    }
    return res.redirect(backLink)
  }
}
