import { Request, Response } from 'express'
import { validate, ValidationError } from 'class-validator'
import { plainToClass } from 'class-transformer'
import LicenceService from '../../../services/licenceService'
import LicenceStatus from '../../../enumeration/licenceStatus'
import { Licence } from '../../../@types/licenceApiClientTypes'
import LicenceToSubmit from '../types/licenceToSubmit'
import { FieldValidationError } from '../../../middleware/validationMiddleware'

export default class CheckAnswersRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    res.render('pages/create/checkAnswers')
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { username } = req.user

    const licence = await this.licenceService.getLicence(licenceId, username)
    const errors = await this.validateLicence(licence)
    if (errors.length > 0) {
      req.flash('validationErrors', JSON.stringify(errors))
      return res.redirect('back')
    }

    await this.licenceService.updateStatus(licenceId, LicenceStatus.SUBMITTED, username)
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
