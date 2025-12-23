import { Request, Response } from 'express'

export default class ReportHomeRoutes {
  constructor() {}

  GET = async (req: Request, res: Response): Promise<void> => {
    res.render('pages/reports/index', {})
  }
}
