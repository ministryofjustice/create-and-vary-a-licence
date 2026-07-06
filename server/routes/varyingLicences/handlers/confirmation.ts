import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import LicenceType from '../../../enumeration/licenceType'
import LicenceKind from '../../../enumeration/LicenceKind'
import { assertIsVariation, convertToTitleCase } from '../../../utils/utils'

export default class ConfirmationRoutes {
  constructor(private licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals

    assertIsVariation(licence)
    const backLink = req.session.returnToCase || '/licence/vary/caseload'
    const parentLicence = await this.licenceService.getLicence(licence.variationOf, res.locals.user)
    const isTimeServedVariation = parentLicence.kind === LicenceKind.TIME_SERVED

    let titleText
    let licenceType
    const fullName = convertToTitleCase(`${licence.forename || ''} ${licence.surname || ''}`.trim())

    switch (licence.typeCode) {
      case LicenceType.AP_PSS:
        licenceType = 'licence and post sentence supervision order'
        titleText = `Licence conditions variation for ${fullName} sent`
        break
      case LicenceType.AP:
        licenceType = 'licence'
        titleText = `Licence variation for ${fullName} sent`
        break
      case LicenceType.PSS:
        licenceType = 'post sentence supervision order'
        titleText = `Post sentence supervision order variation for ${fullName} sent`
        break
      default: {
        // silently ignore
      }
    }

    res.render('pages/vary/confirmation', { titleText, licenceType, backLink, isTimeServedVariation })
  }
}
