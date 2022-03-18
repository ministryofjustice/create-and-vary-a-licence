import { Request, Response } from 'express'

export default class ContactUsRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    res.render('pages/contactUs')
  }
}
