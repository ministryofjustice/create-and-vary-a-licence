import { Request, Response } from 'express'
import { validate, ValidationError } from 'class-validator'
import { plainToInstance } from 'class-transformer'
import LicenceService from '../../../services/licenceService'
import { Licence } from '../../../@types/licenceApiClientTypes'
import LicenceToSubmit from '../types/licenceToSubmit'
import { FieldValidationError } from '../../../middleware/validationMiddleware'
import LicenceType from '../../../enumeration/licenceType'
import ConditionService from '../../../services/conditionService'
import { groupingBy, isHdcLicence, isInHardStopPeriod, isVariation } from '../../../utils/utils'
import HdcService from '../../../services/hdcService'

export default class CheckAnswersRoutes {
  constructor(
    private readonly licenceService: LicenceService,
    private readonly conditionService: ConditionService,
    private readonly hdcService: HdcService,
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence, user } = res.locals
    const backLink = req.session?.returnToCase || '/licence/create/caseload'

    // Record the view event only when an officer views a licence which is not their own
    if (licence?.comStaffId !== user?.deliusStaffIdentifier) {
      // Recorded here as we do not know the reason for fetchLicence in the API
      await this.licenceService.recordAuditEvent(
        `Licence viewed for ${licence?.forename} ${licence?.surname}`,
        `ID ${licence?.id} type ${licence?.typeCode} status ${licence?.statusCode} version ${licence?.version}`,
        licence.id,
        new Date(),
        user,
      )
    }

    const conditionsToDisplay = await this.conditionService.getAdditionalAPConditionsForSummaryAndPdf(licence, user)
    const bespokeConditionsToDisplay = await this.conditionService.getbespokeConditionsForSummaryAndPdf(licence, user)
    const omuEmail = (await this.licenceService.getOmuEmail(licence.prisonCode, user))?.email

    const hdcLicenceData = isHdcLicence(licence) ? await this.hdcService.getHdcLicenceData(licence.id) : null

    res.render('pages/create/checkAnswers', {
      additionalConditions: groupingBy(conditionsToDisplay, 'code'),
      bespokeConditionsToDisplay,
      backLink,
      initialApptUpdatedMessage: req.flash('initialApptUpdated')?.[0],
      canEditInitialAppt: !isVariation(licence) && !isInHardStopPeriod(licence),
      statusCode: licence.statusCode,
      isInHardStopPeriod: isInHardStopPeriod(licence),
      omuEmail,
      hdcLicenceData,
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { licence, user } = res.locals

    const errors = await this.validateLicence(licence)
    if (errors.length > 0) {
      req.flash('validationErrors', JSON.stringify(errors))
      const referer = req.get('Referer') || `/licence/create/id/${licenceId}/check-your-answers`
      return res.redirect(referer)
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

    if (licence.kind === 'VARIATION' || licence.kind === 'HDC_VARIATION') {
      return res.redirect(`/licence/vary/id/${licence.id}/reason-for-variation`)
    }

    await this.licenceService.submitLicence(licenceId, user)

    return res.redirect(`/licence/create/id/${licenceId}/confirmation`)
  }

  private validateLicence = async (licence: Licence): Promise<FieldValidationError[]> => {
    const licenceToSubmit = plainToInstance(LicenceToSubmit, licence, { excludeExtraneousValues: true })
    const errors: ValidationError[] = await validate(licenceToSubmit)
    return this.flattenValidationErrors(errors)
  }

  flattenValidationErrors = (errors: ValidationError[], parentProperty = ''): FieldValidationError[] =>
    errors.flatMap(error => {
      const propertyPath = parentProperty ? `${parentProperty}-${error.property}` : error.property
      const current = error.constraints ? [{ field: propertyPath, message: Object.values(error.constraints)[0] }] : []
      const children = error.children ? this.flattenValidationErrors(error.children, propertyPath) : []
      return [...current, ...children]
    })
}
