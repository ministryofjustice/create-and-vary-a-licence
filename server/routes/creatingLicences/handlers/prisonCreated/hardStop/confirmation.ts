import { Request, Response } from 'express'
import LicenceType from '../../../../../enumeration/licenceType'

export default class ConfirmationRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals

    let titleText
    let confirmationMessage
    const backLink = '/licence/view/cases'
    switch (licence.typeCode) {
      case LicenceType.AP_PSS:
        titleText = `Licence and post sentence supervision order for ${licence.forename} ${licence.surname} sent`
        break
      case LicenceType.AP:
        titleText = `Licence conditions for ${licence.forename} ${licence.surname} sent`
        break
      case LicenceType.PSS:
        titleText = `Post sentence supervision order for ${licence.forename} ${licence.surname} sent`
        break
      default: {
        // silently ignore
      }
    }

    res.render('pages/create/prisonCreated/hardStop/confirmation', { titleText, confirmationMessage, backLink })
  }
}
