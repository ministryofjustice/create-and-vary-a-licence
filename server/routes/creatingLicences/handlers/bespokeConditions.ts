import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'

export default class BespokeConditionsRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const conditionsList = res.locals?.licence?.bespokeConditions || []
    const conditions = conditionsList?.length > 0 ? conditionsList.map((c: { text: string }) => c.text) : []
    res.render('pages/create/bespokeConditions', { conditions })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    // TODO: Some work to do here to redirect to the same page if "Add another" or "Remove" is selected and javascript is off
    const { licenceId } = req.params
    const { username } = res.locals.user
    await this.licenceService.updateBespokeConditions(licenceId, req.body, username)
    res.redirect(`/licence/create/id/${licenceId}/check-your-answers`)
  }
}
