import { Request, Response } from 'express'

export default class CurfewAddressRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    res.render('pages/vary/hdc/curfewAddress')
  }

  POST = async (_req: Request, res: Response): Promise<void> => {}
}
