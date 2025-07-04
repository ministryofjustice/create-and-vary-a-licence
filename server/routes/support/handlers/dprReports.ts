import { Request, Response } from 'express'

export default class DprReportsRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    res.render('pages/support/reports', {})
  }
}
