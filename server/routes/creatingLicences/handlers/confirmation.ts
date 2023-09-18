import { Request, Response } from 'express'
import LicenceType from '../../../enumeration/licenceType'

export default class ConfirmationRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals
    const backLink = req.session.returnToCase || '/licence/create/caseload'

    let titleText
    let confirmationMessage

    switch (licence.typeCode) {
      case LicenceType.AP_PSS:
        titleText = `Licence and post sentence supervision order for ${licence.forename} ${licence.surname} sent`
        confirmationMessage = `We have sent the licence and post sentence supervision order to ${licence.prisonDescription} for approval.`
        break
      case LicenceType.AP:
        titleText = `Licence conditions for ${licence.forename} ${licence.surname} sent`
        confirmationMessage = `We have sent the licence to ${licence.prisonDescription} for approval.`
        break
      case LicenceType.PSS:
        titleText = `Post sentence supervision order for ${licence.forename} ${licence.surname} sent`
        confirmationMessage = `We have sent the post sentence supervision order to ${licence.prisonDescription} for approval.`
        break
      default: {
        // silently ignore
      }
    }

    res.render('pages/create/confirmation', { titleText, confirmationMessage, backLink })
  }
}
