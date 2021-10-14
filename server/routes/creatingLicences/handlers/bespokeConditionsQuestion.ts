import { Request, Response } from 'express'
import YesOrNo from '../../../enumeration/yesOrNo'
import LicenceService from '../../../services/licenceService'
import BespokeConditions from '../types/bespokeConditions'

export default class BespokeConditionsQuestionRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    res.render('pages/create/bespokeConditionsQuestion')
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { username } = req.user
    const { answer } = req.body
    if (answer === YesOrNo.YES) {
      res.redirect(
        `/licence/create/id/${licenceId}/bespoke-conditions${req.query?.fromReview ? '?fromReview=true' : ''}`
      )
    } else {
      await this.licenceService.updateBespokeConditions(licenceId, { conditions: [] } as BespokeConditions, username)
      res.redirect(`/licence/create/id/${licenceId}/check-your-answers`)
    }
  }
}
