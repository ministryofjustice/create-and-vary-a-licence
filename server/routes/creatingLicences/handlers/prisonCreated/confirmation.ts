import { Request, Response } from 'express'
import LicenceType from '../../../../enumeration/licenceType'
import { convertToTitleCase } from '../../../../utils/utils'

export default class ConfirmationRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals

    let titleText
    const backLink = '/licence/view/cases'
    const fullName = convertToTitleCase(`${licence.forename || ''} ${licence.surname || ''}`.trim())
    switch (licence.typeCode) {
      case LicenceType.AP_PSS:
        titleText = `Licence and post sentence supervision order for ${fullName} sent`
        break
      case LicenceType.AP:
        titleText = `Licence conditions for ${fullName} sent`
        break
      case LicenceType.PSS:
        titleText = `Post sentence supervision order for ${fullName} sent`
        break
      default: {
        // silently ignore
      }
    }

    res.render('pages/create/prisonCreated/confirmation', { titleText, backLink })
  }
}
