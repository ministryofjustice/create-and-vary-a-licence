import { plainToClass } from 'class-transformer'
import { validate, ValidationError } from 'class-validator'
import { RequestHandler } from 'express'

export type FieldValidationError = {
  field: string
  message: string
}

function validationMiddleware(type: new () => unknown, useChildPath = false): RequestHandler {
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
      },
      path?: string
    ): FieldValidationError => ({
      field: useChildPath && path ? path : error.property,
      message: Object.values(constraints)[Object.values(constraints).length - 1],
    })

    const mapErrors = (error: ValidationError) =>
      error.children.length > 0
        ? error.children.map((childError: ValidationError) =>
            addError(error, childError.constraints, `${error.property}[${childError.property}]`)
          )
        : addError(error, error.constraints)

    req.flash('validationErrors', JSON.stringify(errors.flatMap(mapErrors)))
    req.flash('formResponses', JSON.stringify(req.body))

    return res.redirect('back')
  }
}

export default validationMiddleware
