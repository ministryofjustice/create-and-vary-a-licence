import { Request, Response } from 'express'
import { convertToTitleCase } from '../../../../utils/utils'

export default class ConfirmationRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals

    const backLink = '/licence/view/cases'
    const fullName = convertToTitleCase(`${licence.forename || ''} ${licence.surname || ''}`.trim())
    const titleText = `Licence conditions for ${fullName} sent`

    res.render('pages/create/prisonCreated/confirmation', { titleText, backLink })
  }
}
