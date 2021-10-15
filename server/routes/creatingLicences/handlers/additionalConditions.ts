import { Request, Response } from 'express'
import { getGroupedAdditionalConditions } from '../../../utils/conditionsProvider'

export default class AdditionalConditionsRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    const additionalConditions = getGroupedAdditionalConditions()
    return res.render('pages/create/additionalConditions', { additionalConditions })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params

    if (req.query?.fromReview) {
      res.redirect(`/licence/create/id/${licenceId}/check-your-answers`)
    } else {
      res.redirect(`/licence/create/id/${licenceId}/bespoke-conditions-question`)
    }
  }
}
