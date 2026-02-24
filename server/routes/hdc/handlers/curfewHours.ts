import { Request, Response } from 'express'
import HdcService from '../../../services/hdcService'
import CurfewTimes from '../types/curfewTimes'

export default class CurfewHoursRoutes {
  constructor(private readonly hdcService: HdcService) {}

  GET = async (req: Request, res: Response): Promise<void> => res.render('pages/hdc/curfewHours')

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licence, user } = res.locals
    const curfewTimes = req.body as CurfewTimes
    await this.hdcService.updateCurfewTimes(licence.id, curfewTimes, user)
    return res.redirect(`/licence/create/id/${licence.id}/additional-licence-conditions-question`)
  }
}
