import { ClassConstructor, plainToClass } from 'class-transformer'
import { validate, ValidationError } from 'class-validator'
import { RequestHandler } from 'express'
import { getAdditionalConditionByCode } from '../utils/conditionsProvider'

export type FieldValidationError = {
  field: string
  message: string
}

function validationMiddleware(type?: new () => object): RequestHandler {
  return async (req, res, next) => {
    const { licence } = res.locals

    const classType = (getAdditionalConditionByCode(req.body.code)?.type as ClassConstructor<object>) || type

    // If there is a file upload present in the request make this available in the validation scope
    const validationScope = req.file
      ? plainToClass(classType, { ...req.body, licence, uploadFile: req.file }, { excludeExtraneousValues: false })
      : plainToClass(classType, { ...req.body, licence }, { excludeExtraneousValues: false })

    const errors: ValidationError[] = await validate(validationScope)

    if (errors.length === 0) {
      req.body = plainToClass(classType, req.body, { excludeExtraneousValues: true })
      return next()
    }

    const buildError = (
      error: ValidationError,
      constraints: {
        [type: string]: string
      }
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

    return res.redirect('back')
  }
}

export default validationMiddleware
