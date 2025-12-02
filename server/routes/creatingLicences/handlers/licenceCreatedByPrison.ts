import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'

export default class PrisonWillCreateThisLicenceRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence, user } = res.locals
    const backLink = req.session.returnToCase || '/licence/create/caseload'
    const omuEmailResponse = await this.licenceService.getOmuEmail(licence.prisonCode, user)
    const email = omuEmailResponse?.email || null

    return res.render('pages/create/licenceCreatedByPrison', {
      licence,
      omuEmail: email,
      backLink,
    })
  }
}
