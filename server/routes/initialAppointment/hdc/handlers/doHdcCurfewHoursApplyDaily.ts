import { Request, Response } from 'express'

export default class DoHdcCurfewHoursApplyDailyRoutes {
  GET = async (req: Request, res: Response): Promise<void> => res.render('pages/hdc/doHdcCurfewHoursApplyDaily')

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { answer } = req.body
    const nextPath = answer === 'Yes' ? 'curfew-hours' : 'individual-curfew-hours'

    const redirectPath = `/licence/create/id/${licenceId}/hdc/${nextPath}${
      req.query?.fromReview ? '?fromReview=true' : ''
    }`

    res.redirect(redirectPath)
  }
}
