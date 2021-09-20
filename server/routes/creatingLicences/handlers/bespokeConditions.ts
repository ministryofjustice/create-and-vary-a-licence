import { Request, Response } from 'express'

export default class BespokeConditionsRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    const offender = {
      name: 'Adam Balasaravika',
    }
    res.render('pages/create/bespokeConditions', { offender })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    // TODO: Some work to do here to redirect to the same page if "Add another" or "Remove" is selected and javascript is turned off browserside
    const { licenceId } = req.params
    res.redirect(`/licence/create/id/${licenceId}/check-your-answers`)
  }
}
