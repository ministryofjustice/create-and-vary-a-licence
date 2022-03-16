import { Request, Response } from 'express'
import LicenceType from '../../../enumeration/licenceType'

export default class ConfirmApprovedRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals

    let titleText
    let confirmationMessage

    switch (licence.typeCode) {
      case LicenceType.AP_PSS:
        titleText = `Licence and post sentence supervision order for ${licence.forename} ${licence.surname} approved`
        confirmationMessage = `You have approved the licence and post sentence supervision order for ${licence.forename} ${licence.surname}.`
        break
      case LicenceType.AP:
        titleText = `Licence conditions for ${licence.forename} ${licence.surname} approved`
        confirmationMessage = `You have approved the licence conditions for ${licence.forename} ${licence.surname}.`
        break
      case LicenceType.PSS:
        titleText = `Post sentence supervision order for ${licence.forename} ${licence.surname} approved`
        confirmationMessage = `You have approved the post sentence supervision order for ${licence.forename} ${licence.surname}.`
        break
    }

    res.render('pages/approve/confirmation', { titleText, confirmationMessage })
  }
}
