import { registerDecorator, ValidateIf, ValidationOptions } from 'class-validator'
import isSimpleTimeAfter from './isSimpleTimeAfter'
import { objectIsEmpty } from '../utils/utils'
import hasAtLeastOne from './hasAtLeastOne'

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

export function HasAtLeastOne(validationOptions?: ValidationOptions) {
  return (object: unknown, propertyName: string) => {
    registerDecorator({
      name: 'hasAtLeastOne',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: { validate: hasAtLeastOne },
    })
  }
}

export function IsOptional() {
  return ValidateIf((object, value) => {
    return !objectIsEmpty(value)
  })
}

export function Either(fieldName: string) {
  return ValidateIf((object, value) => {
    return !objectIsEmpty(value) || objectIsEmpty(object[fieldName])
  })
}
