import { registerDecorator, ValidationOptions } from 'class-validator'
import isSimpleTimeAfter from './isSimpleTimeAfter'

export default function IsSimpleTimeAfter(property: string, validationOptions?: ValidationOptions) {
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
