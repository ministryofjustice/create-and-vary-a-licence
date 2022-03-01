import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'

export default class VariationSummaryRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    // const { licence, user } = res.locals
    //
    // const conditionComparison = await this.licenceService.compareVariationToOriginal(licence, user)
    //
    // res.render('pages/vary/variationSummary', {
    //   conditionComparison,
    // })

    res.render('pages/vary/variationSummary')
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { user } = res.locals

    await this.licenceService.submitLicence(licenceId, user)

    return res.redirect(`/licence/vary/id/${licenceId}/confirmation`)
  }
}
