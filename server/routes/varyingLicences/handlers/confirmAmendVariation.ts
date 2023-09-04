import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import YesOrNo from '../../../enumeration/yesOrNo'
import LicenceStatus from '../../../enumeration/licenceStatus'
import LicenceType from '../../../enumeration/licenceType'
import ConditionService from '../../../services/conditionService'

export default class ConfirmAmendVariationRoutes {
  constructor(private readonly licenceService: LicenceService, private readonly conditionService: ConditionService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    res.render('pages/vary/confirmAmendVariation')
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { answer } = req.body
    const { user, licence } = res.locals

    if (answer === YesOrNo.YES) {
      await this.licenceService.updateStatus(parseInt(licenceId, 10), LicenceStatus.VARIATION_IN_PROGRESS, user)
      /**
       * TODO
       * replace when proper versioning functionality is ready.
       * update the standard conditions to the current policy version if
       * licence was created on a previous version.
       */
      if (
        (await this.licenceService.getParentLicenceOrSelf(parseInt(licenceId, 10), user)).version !==
        (await this.conditionService.getPolicyVersion())
      ) {
        const newStdConditions = {
          standardLicenceConditions: [LicenceType.AP, LicenceType.AP_PSS].includes(licence.typeCode as LicenceType)
            ? await this.conditionService.getStandardConditions(LicenceType.AP)
            : [],
          standardPssConditions: [LicenceType.PSS, LicenceType.AP_PSS].includes(licence.typeCode as LicenceType)
            ? await this.conditionService.getStandardConditions(LicenceType.PSS)
            : [],
        }
        await this.licenceService.updateStandardConditions(licenceId, newStdConditions, user)
      }
      return res.redirect(`/licence/create/id/${licenceId}/check-your-answers`)
    }

    return res.redirect(`/licence/vary/id/${licenceId}/view`)
  }
}
