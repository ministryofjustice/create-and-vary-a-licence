import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import YesOrNo from '../../../enumeration/yesOrNo'
import LicenceStatus from '../../../enumeration/licenceStatus'
import { getStandardConditions, getVersion } from '../../../utils/conditionsProvider'
import LicenceType from '../../../enumeration/licenceType'

export default class ConfirmAmendVariationRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    res.render('pages/vary/confirmAmendVariation')
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { answer } = req.body
    const { user, licence } = res.locals

    if (answer === YesOrNo.YES) {
      await this.licenceService.updateStatus(licenceId, LicenceStatus.VARIATION_IN_PROGRESS, user)
      /**
       * TODO
       * replace when proper versioning functionality is ready.
       * update the standard conditions to the current policy version if
       * licence was created on a previous version.
       */
      if (licence.version !== getVersion()) {
        const newStdConditions = {
          standardLicenceConditions: [LicenceType.AP, LicenceType.AP_PSS].includes(licence.typeCode)
            ? getStandardConditions(LicenceType.AP)
            : [],
          standardPssConditions: [LicenceType.PSS, LicenceType.AP_PSS].includes(licence.typeCode)
            ? getStandardConditions(LicenceType.PSS)
            : [],
        }
        await this.licenceService.updateStandardConditions(licenceId, newStdConditions, user)
      }
      return res.redirect(`/licence/create/id/${licenceId}/check-your-answers`)
    }

    return res.redirect(`/licence/vary/id/${licenceId}/view`)
  }
}
