import { plainToClass } from 'class-transformer'
import { validate, ValidationError } from 'class-validator'
import { RequestHandler } from 'express'

export type FieldValidationError = {
  field: string
  message: string
}

function validationMiddleware(type: new () => unknown): RequestHandler {
  return async (req, res, next) => {
    const errors: ValidationError[] = await validate(
      // eslint-disable-next-line @typescript-eslint/ban-types
      plainToClass(type, req.body, { excludeExtraneousValues: true }) as object
    )

    if (errors.length === 0) {
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
