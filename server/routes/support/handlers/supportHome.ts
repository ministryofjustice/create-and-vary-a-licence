import { RequestHandler } from 'express'

export default class SupportHomeRoutes {
  public GET: RequestHandler = async (req, res): Promise<void> => {
    res.render('pages/support/home')
  }
}
