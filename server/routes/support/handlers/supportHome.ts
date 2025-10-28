import { Request, Response } from 'express'

export default class SupportHomeRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    res.render('pages/support/home')
  }
}
