import { Request, Response } from 'express'

export default class OptOutInterruptHandler {
  constructor() {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const backLink = req.session?.returnToCase || '/licence/create/caseload'
    const toCheckYourAnswer = `/licence/create/id/${licenceId}/check-your-answers`
    res.render('pages/create/optOutInterrupt', {
      backLink,
      toCheckYourAnswer,
    })
  }
}
