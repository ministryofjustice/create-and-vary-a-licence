import { Request, Response } from 'express'

export default class ConfirmApprovedRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    res.render('pages/approve/approved')
  }
}
