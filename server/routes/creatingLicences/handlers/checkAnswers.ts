import { Request, Response } from 'express'
import { validate, ValidationError } from 'class-validator'
import { plainToClass } from 'class-transformer'
import LicenceService from '../../../services/licenceService'
import { Licence } from '../../../@types/licenceApiClientTypes'
import LicenceToSubmit from '../types/licenceToSubmit'
import { FieldValidationError } from '../../../middleware/validationMiddleware'
import { expandAdditionalConditions } from '../../../utils/conditionsProvider'

export default class CheckAnswersRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals
    const expandedLicenceConditions = expandAdditionalConditions(licence.additionalLicenceConditions)
    const expandedPssConditions = expandAdditionalConditions(licence.additionalPssConditions)
    res.render('pages/create/checkAnswers', { expandedLicenceConditions, expandedPssConditions })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { licence, user } = res.locals

    const errors = await this.validateLicence(licence)
    if (errors.length > 0) {
      req.flash('validationErrors', JSON.stringify(errors))
      return res.redirect('back')
    }

    await this.licenceService.submitLicence(licenceId, user)

    return res.redirect(`/licence/create/id/${licenceId}/confirmation`)
  }

  private validateLicence = async (licence: Licence): Promise<FieldValidationError[]> => {
    const licenceToSubmit = plainToClass(LicenceToSubmit, licence, { excludeExtraneousValues: true })
    const errors: ValidationError[] = await validate(licenceToSubmit)

    return errors.flatMap(error => ({
      field: error.property,
      message: Object.values(error.constraints)[Object.values(error.constraints).length - 1],
    }))
  }
}
