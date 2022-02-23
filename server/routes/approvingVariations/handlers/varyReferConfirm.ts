import { Request, Response } from 'express'

export default class VaryReferConfirmRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    res.render('pages/vary-approve/variation-referred')
  }
}
