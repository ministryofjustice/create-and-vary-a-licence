import { Request, Response } from 'express'

export default class ManualAddressEntryRoutes {
  constructor() {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const fromReview = req.query?.fromReview
    const fromReviewParam = fromReview ? '?fromReview=true' : ''
    const basePath = `/licence/vary/id/${licenceId}/hdc`
    res.render('pages/hdc/manualAddressEntry', {
      postcodeLookupUrl: `${basePath}/find-the-new-curfew-address${fromReviewParam}`,
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params

    res.redirect(`/licence/create/id/${licenceId}/check-your-answers`)
  }
}
