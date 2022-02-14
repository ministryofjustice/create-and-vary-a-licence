import { Request, Response } from 'express'
import config from '../../../config'

export default class RolloutRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    res.render('pages/rollout-status', { authSource: user?.authSource, homeUrl: config.apis.hmppsAuth.url })
  }
}
