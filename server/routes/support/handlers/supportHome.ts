import { Request, Response } from 'express'
import config from '../../../config'

export default class SupportHomeRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    const { dprReportingEnabled } = config
    res.render('pages/support/home', { dprReportingEnabled })
  }
}
