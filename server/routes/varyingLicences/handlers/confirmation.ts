import { Request, Response } from 'express'
import { assertIsVariation, convertToTitleCase } from '../../../utils/utils'

export default class ConfirmationRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals

    assertIsVariation(licence)
    const backLink = req.session.returnToCase || '/licence/vary/caseload'

    const fullName = convertToTitleCase(`${licence.forename || ''} ${licence.surname || ''}`.trim())
    const titleText = `Licence variation for ${fullName} sent`

    res.render('pages/vary/confirmation', { titleText, backLink })
  }
}
