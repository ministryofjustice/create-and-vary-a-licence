import { Request, Response } from 'express'

export default class DprHomeRoutes {
  constructor() {}

  GET = async (req: Request, res: Response): Promise<void> => {
    res.render('pages/dpr/reports', {})
  }
}
