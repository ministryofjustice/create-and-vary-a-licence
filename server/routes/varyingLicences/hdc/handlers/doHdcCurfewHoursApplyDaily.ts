import { Request, Response } from 'express'

export default class DoHdcCurfewHoursApplyDailyRoutes {
  GET = async (req: Request, res: Response): Promise<void> => res.render('pages/hdc/doHdcCurfewHoursApplyDaily')

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals
    const { answer } = req.body
    const nextPath = answer === 'Yes' ? 'curfew-hours' : 'individual-curfew-hours'

    const redirectPath = `/licence/vary/id/${licence.id}/hdc/${nextPath}${
      req.query?.fromReview ? '?fromReview=true' : ''
    }`

    res.redirect(redirectPath)
  }
}
