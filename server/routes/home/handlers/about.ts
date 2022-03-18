import { Request, Response } from 'express'

export default class AboutRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    res.render('pages/about')
  }
}
