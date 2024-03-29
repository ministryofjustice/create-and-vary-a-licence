import { Request, Response } from 'express'
import LicenceType from '../../../enumeration/licenceType'

export default class ConfirmationRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals
    const backLink = req.session.returnToCase || '/licence/vary/caseload'

    let titleText
    let licenceType

    switch (licence.typeCode) {
      case LicenceType.AP_PSS:
        licenceType = 'licence and post sentence supervision order'
        titleText = `Licence conditions variation for ${licence.forename} ${licence.surname} sent`
        break
      case LicenceType.AP:
        licenceType = 'licence'
        titleText = `Licence variation for ${licence.forename} ${licence.surname} sent`
        break
      case LicenceType.PSS:
        licenceType = 'post sentence supervision order'
        titleText = `Post sentence supervision order variation for ${licence.forename} ${licence.surname} sent`
        break
      default: {
        // silently ignore
      }
    }

    res.render('pages/vary/confirmation', { titleText, licenceType, backLink })
  }
}
