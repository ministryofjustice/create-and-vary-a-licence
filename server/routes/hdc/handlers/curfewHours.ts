import { Request, Response } from 'express'
import { buildCurfewTimesRequest } from '../../../utils/utils'
import LicenceService from '../../../services/licenceService'

export default class CurfewHoursRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => res.render('pages/hdc/curfewHours')

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licence, user } = res.locals
    const { curfewStart, curfewEnd } = req.body
    await this.licenceService.updateCurfewTimes(licence.id, buildCurfewTimesRequest(curfewStart, curfewEnd), user)
    return res.redirect(`/licence/create/id/${licence.id}/additional-licence-conditions-question`)
  }
}
