import { Request, Response } from 'express'

export default class DoHdcCurfewHoursApplyDailyRoutes {
  GET = async (req: Request, res: Response): Promise<void> => res.render('pages/hdc/doHdcCurfewHoursApplyDaily')

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const nextPath = req.body.answer === 'Yes' ? 'curfew-hours' : 'do-hdc-curfew-hours-apply-daily'

    res.redirect(`/licence/create/id/${licenceId}/hdc/${nextPath}`)
  }
}
