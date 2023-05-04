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
    let licenceType

    switch (licence.typeCode) {
      case LicenceType.AP_PSS:
        licenceType = 'licence and post sentence supervision order'
        titleText = `Variation for ${licence.forename} ${licence.surname} sent`
        break
      case LicenceType.AP:
        licenceType = 'licence'
        titleText = `Licence variation for ${licence.forename} ${licence.surname} sent`
        break
      case LicenceType.PSS:
        licenceType = 'post sentence supervision order'
        titleText = `Post sentence supervision order variation for ${licence.forename} ${licence.surname} sent`
        break
    }

<<<<<<< HEAD
    res.render('pages/vary/confirmation', { titleText, licenceType, backLink })
=======
    res.render('pages/vary/confirmation', { titleText, licenceType, backLinkHref })
>>>>>>> cb43f66 (CVSL-990-Returns user to wrong place after submitting)
  }
}
