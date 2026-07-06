import { Request, Response } from 'express'
import LicenceType from '../../../enumeration/licenceType'
import { convertToTitleCase } from '../../../utils/utils'

export default class ConfirmationRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals

    let titleText
    let confirmationMessage
    const backLink = req.session.returnToCase || '/licence/create/caseload'
    const { kind } = licence
    const fullName = convertToTitleCase(`${licence.forename || ''} ${licence.surname || ''}`.trim())

    switch (licence.typeCode) {
      case LicenceType.AP:
        titleText = `Licence conditions for ${fullName} sent`
        confirmationMessage = `We have sent the licence to ${licence.prisonDescription} for approval.`
        break
      default: {
        // silently ignore
      }
    }

    res.render('pages/create/confirmation', { titleText, confirmationMessage, backLink, kind })
  }
}
