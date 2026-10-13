import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'

export default class PostponedInterruptHandler {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { licence, user } = res.locals
    const backLink = req.session?.returnToCase || '/licence/create/caseload'
    const toCheckYourAnswer = `/licence/create/id/${licenceId}/check-your-answers`
    const omuEmail = (await this.licenceService.getOmuEmail(licence.prisonCode, user))?.email
    const omuContact = omuEmail ?? licence.prisonCode

    res.render('pages/create/postponedInterrupt', {
      backLink,
      toCheckYourAnswer,
      omuContact,
    })
  }
}
