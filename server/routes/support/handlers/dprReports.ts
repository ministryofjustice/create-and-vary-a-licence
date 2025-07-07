import { Request, Response } from 'express'
import DprService from '../../../services/dprService'

export default class DprReportsRoutes {
  constructor(private readonly dprService: DprService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const definitions = await this.dprService.getDefinitions(user)
    console.log(definitions)
    res.render('pages/support/reports', {})
  }
}
