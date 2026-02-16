import { Request, Response } from 'express'

export default class DoHdcCurfewHoursApplyDailyRoutes {
  GET = async (req: Request, res: Response): Promise<void> => res.render('partials/hdc/doHdcCurfewHoursApplyDaily')

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    return res.redirect(`/licence/create/id/${licenceId}/do-hdc-curfew-hours-apply-daily`)
  }
}
