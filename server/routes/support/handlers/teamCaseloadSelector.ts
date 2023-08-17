import { Request, Response } from 'express'

export default class TeamCaseloadSelectorRoutes {

  GET = async (req: Request, res: Response) => {
    const { regionCode, teamCode } = req.params
    res.render('pages/support/indexTiles', { regionCode, teamCode })
  }
}