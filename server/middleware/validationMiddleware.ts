import { plainToInstance } from 'class-transformer'
import { validate, ValidationError } from 'class-validator'
import { RequestHandler } from 'express'
import ConditionService from '../services/conditionService'

export type FieldValidationError = {
  field: string
  message: string
}

function validationMiddleware(conditionService: ConditionService, type?: new () => object): RequestHandler {
  return async (req, res, next) => {
    try {
      const { licence } = res.locals

      let classType
      if (licence) {
        classType =
          (await conditionService.getAdditionalConditionByCode(req.body?.code, licence.version))?.validatorType || type
      } else {
        classType = (await conditionService.getAdditionalConditionByCode(req.body?.code))?.validatorType || type
      }
      // Cater for file uploads on specific forms - in this case to setup the filename in the req.body
      if (req.file && req.file.fieldname === 'outOfBoundFilename') {
        req.body = { ...req.body, outOfBoundFilename: req.file.originalname }
      }

      // Build an object which is used by validators to check things against
      const validationScope = plainToInstance(
        classType,
        { ...req.body, licence, uploadFile: req.file },
        { excludeExtraneousValues: false },
      )

      const errors: ValidationError[] = await validate(validationScope, { forbidUnknownValues: false })
      if (errors.length === 0) {
        req.body = plainToInstance(classType, req.body, { excludeExtraneousValues: true })
        return next()
      }

      const buildError = (
        error: ValidationError,
        constraints: {
          [type: string]: string
        },
      ): FieldValidationError => ({
        field: error.property,
        message: Object.values(constraints)[Object.values(constraints).length - 1],
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const flattenErrors: any = (errorList: ValidationError[]) => {
        // Flat pack a list of errors with child errors into a 1-dimensional list of errors.
        return errorList.flatMap(error => {
          return error.children.length > 0 ? flattenErrors(error.children) : buildError(error, error.constraints)
        })
      }

      req.flash('validationErrors', JSON.stringify(flattenErrors(errors)))
      req.flash('formResponses', JSON.stringify(req.body))

      const referer = req.get('Referer')
      if (!referer) return next(new Error('Missing Referer header'))
      return res.redirect(referer)
    } catch (error) {
      return next(
        new Error(`Failed to validate licence details for: ${req.params.nomisId}`, {
          cause: error,
        }),
      )
    }
  }
}

export default validationMiddleware
