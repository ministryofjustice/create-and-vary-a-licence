import { Request, Response } from 'express'

export default class PathfinderRoutes {
  constructor() {}

  GET = async (req: Request, res: Response): Promise<void> => {
    return res.render('pages/manageConditions/pathfinder/input')
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals

    if (req.query?.fromReview) {
      return res.redirect(`/licence/create/id/${licence.id}/check-your-answers`)
    }

    return res.redirect(`/licence/create/id/${licence.id}/bespoke-conditions-question`)
  }
}
