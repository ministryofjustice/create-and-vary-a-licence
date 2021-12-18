import { Request, Response } from 'express'

export default class ComDetailsRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    res.render('pages/view/comDetails')
  }
}
