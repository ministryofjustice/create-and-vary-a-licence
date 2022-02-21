import { Request, Response } from 'express'
import LicenceType from '../../../enumeration/licenceType'

export default class ConfirmationRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals

    let titleText

    switch (licence.typeCode) {
      case LicenceType.AP_PSS:
        titleText = `Licence and post sentence supervision order variation for ${licence.forename} ${licence.surname} sent`
        break
      case LicenceType.AP:
        titleText = `Licence variation for ${licence.forename} ${licence.surname} sent`
        break
      case LicenceType.PSS:
        titleText = `Post sentence supervision order variation for ${licence.forename} ${licence.surname} sent`
        break
    }

    res.render('pages/vary/confirmation', { titleText })
  }
}
