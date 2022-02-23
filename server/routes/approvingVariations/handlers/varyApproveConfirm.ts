import { Request, Response } from 'express'

export default class VaryApproveConfirmRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    res.render('pages/vary-approve/approved')
  }
}
