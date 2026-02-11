import type { Request, Response } from 'express'

export default class ReportHomeRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    const { definitions } = res.locals
    res.render('pages/reports/index', { definitions })
  }
}
