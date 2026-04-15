import { Request, Response } from 'express'

export default class DoHdcCurfewHoursApplyDailyRoutes {
  GET = async (req: Request, res: Response): Promise<void> => res.render('pages/hdc/doHdcCurfewHoursApplyDaily')

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const nextPath = req.body.answer === 'Yes' ? 'curfew-hours' : 'individual-curfew-hours'
    if (req.query?.fromReview) {
      return res.redirect(`/licence/create/id/${licenceId}/hdc/${nextPath}?fromReview=true`)
    }
    return res.redirect(`/licence/create/id/${licenceId}/hdc/${nextPath}`)
  }
}
