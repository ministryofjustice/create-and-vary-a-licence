import { registerDecorator, ValidateIf, ValidationOptions } from 'class-validator'
import isSimpleTimeAfter from './isSimpleTimeAfter'
import { hasEmptyFields } from '../utils/utils'

export function IsSimpleTimeAfter(property: string, validationOptions?: ValidationOptions) {
  return (object: unknown, propertyName: string) => {
    registerDecorator({
      name: 'isSimpleTimeAfter',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: { validate: isSimpleTimeAfter },
    })
  }
}

export function IsOptional() {
  return ValidateIf((object, value) => {
    return !hasEmptyFields(value)
  })
}
