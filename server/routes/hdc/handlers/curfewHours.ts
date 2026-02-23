import { Request, Response } from 'express'
import { buildCurfewTimesRequest } from '../../../utils/utils'

export default class CurfewHoursRoutes {
  GET = async (req: Request, res: Response): Promise<void> => res.render('pages/hdc/curfewHours')

  POST = async (req: Request, res: Response): Promise<void> => {
    console.log(req.body)
    const { curfewStart, curfewEnd } = req.body
    const response = buildCurfewTimesRequest(curfewStart, curfewEnd)
    const { licenceId } = req.params
    return res.redirect(`/licence/create/id/${licenceId}/hdc/do-hdc-curfew-hours-apply-daily`)
  }
}
