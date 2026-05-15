import { Request, Response } from 'express'

export default class ExceptionThrower {
  constructor() {}

  GET = async (req: Request, res: Response): Promise<void> => {
    Promise.reject(new Error('an error'))
    return res.render('pages/support/nopage')
  }
}
