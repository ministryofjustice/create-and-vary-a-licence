import { Request, Response } from 'express'
import { convertToTitleCase } from '../../../utils/utils'

export default class ConfirmationRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals

    const backLink = req.session.returnToCase || '/licence/create/caseload'
    const { kind } = licence
    const fullName = convertToTitleCase(`${licence.forename || ''} ${licence.surname || ''}`.trim())

    res.render('pages/create/confirmation', { fullName, prisonDescription: licence.prisonDescription, backLink, kind })
  }
}
