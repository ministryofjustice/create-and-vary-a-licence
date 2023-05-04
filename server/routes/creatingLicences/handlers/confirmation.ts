import { Request, Response } from 'express'
import LicenceType from '../../../enumeration/licenceType'

export default class ConfirmationRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals
<<<<<<< HEAD
    const backLink = req.session.returnToCase
=======
    const backLinkHref = req.session.returnTo
>>>>>>> cb43f66 (CVSL-990-Returns user to wrong place after submitting)

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
    }

<<<<<<< HEAD
    res.render('pages/create/confirmation', { titleText, confirmationMessage, backLink })
=======
    res.render('pages/create/confirmation', { titleText, confirmationMessage, backLinkHref })
>>>>>>> cb43f66 (CVSL-990-Returns user to wrong place after submitting)
  }
}
