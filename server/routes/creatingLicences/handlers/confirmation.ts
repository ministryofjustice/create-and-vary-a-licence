import { Request, Response } from 'express'
import config from '../../../config'

export default class ConfirmationRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    res.render('pages/create/confirmation')
  }
}
