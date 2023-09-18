import { Request, Response } from 'express'
import { validate, ValidationError } from 'class-validator'
import { plainToInstance } from 'class-transformer'
import LicenceService from '../../../services/licenceService'
import { Licence } from '../../../@types/licenceApiClientTypes'
import LicenceToSubmit from '../types/licenceToSubmit'
import { FieldValidationError } from '../../../middleware/validationMiddleware'
import LicenceType from '../../../enumeration/licenceType'
import ConditionService from '../../../services/conditionService'
import { groupingBy } from '../../../utils/utils'

export default class CheckAnswersRoutes {
  constructor(
    private readonly licenceService: LicenceService,
    private readonly conditionService: ConditionService
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence, user } = res.locals
    const backLink = req.session.returnToCase || '/licence/create/caseload'

    // Record the view event only when an officer views a licence which is not their own
    if (licence?.comStaffId !== user?.deliusStaffIdentifier) {
      // Recorded here as we do not know the reason for fetchLicence in the API
      await this.licenceService.recordAuditEvent(
        `Licence viewed for ${licence?.forename} ${licence?.surname}`,
        `ID ${licence?.id} type ${licence?.typeCode} status ${licence?.statusCode} version ${licence?.version}`,
        licence.id,
        new Date(),
        user
      )
    }

    const conditionsToDisplay = await this.conditionService.getAdditionalAPConditionsForSummaryAndPdf(licence, user)
    const bespokeConditionsToDisplay = await this.conditionService.getbespokeConditionsForSummaryAndPdf(licence, user)

    res.render('pages/create/checkAnswers', {
      additionalConditions: groupingBy(conditionsToDisplay, 'code'),
      bespokeConditionsToDisplay,
      backLink,
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { licence, user } = res.locals

    const errors = await this.validateLicence(licence)
    if (errors.length > 0) {
      req.flash('validationErrors', JSON.stringify(errors))
      return res.redirect('back')
    }

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

    if (licence.isVariation) {
      return res.redirect(`/licence/vary/id/${licence.id}/reason-for-variation`)
    }

    await this.licenceService.submitLicence(licenceId, user)

    return res.redirect(`/licence/create/id/${licenceId}/confirmation`)
  }

  private validateLicence = async (licence: Licence): Promise<FieldValidationError[]> => {
    const licenceToSubmit = plainToInstance(LicenceToSubmit, licence, { excludeExtraneousValues: true })
    const errors: ValidationError[] = await validate(licenceToSubmit)

    return errors.flatMap(error => ({
      field: error.property,
      message: Object.values(error.constraints)[Object.values(error.constraints).length - 1],
    }))
  }
}
