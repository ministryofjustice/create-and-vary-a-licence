import type { Request, Response } from 'express'

export default class OtherAgenciesRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    return res.render(`pages/vary/otherAgencies`, {})
  }
}
