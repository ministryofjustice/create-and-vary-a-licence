import { Request, Response } from 'express'

export default class ConfirmRejectedRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    res.render('pages/approve/rejected')
  }
}
