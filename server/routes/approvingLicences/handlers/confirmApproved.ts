import { Request, Response } from 'express'
import LicenceType from '../../../enumeration/licenceType'
import ProbationService from '../../../services/probationService'
import { convertToTitleCase } from '../../../utils/utils'

export default class ConfirmApprovedRoutes {
  constructor(private readonly probationService: ProbationService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals
    const { comUsername } = res.locals.licence
    const comDetails = await this.probationService.getStaffDetailByUsername(comUsername)

    let titleText
    let confirmationMessage
    const fullName = convertToTitleCase(`${licence.forename || ''} ${licence.surname || ''}`.trim())

    switch (licence.typeCode) {
      case LicenceType.AP:
        titleText = `Licence approved`
        confirmationMessage = `A case administrator can now print the licence for ${fullName}.`
        break
      default: {
        // silently ignore
      }
    }

    res.render('pages/approve/confirmation', {
      titleText,
      confirmationMessage,
      isComEmailAvailable: comDetails?.email != null,
    })
  }
}
