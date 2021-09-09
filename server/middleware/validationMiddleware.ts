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

    const addError = (
      error: ValidationError,
      constraints: {
        [type: string]: string
      }
    ): FieldValidationError => ({
      field: error.property,
      message: Object.values(constraints)[Object.values(constraints).length - 1],
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapErrors: any = (error: ValidationError) =>
      error.children.length > 0 ? error.children.flatMap(mapErrors) : addError(error, error.constraints)

    req.flash('validationErrors', JSON.stringify(errors.flatMap(mapErrors)))
    req.flash('formResponses', JSON.stringify(req.body))

    return res.redirect('back')
  }
}

export default validationMiddleware
