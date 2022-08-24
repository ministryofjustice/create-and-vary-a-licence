import { registerDecorator, ValidationOptions } from 'class-validator'

export default class CustomValidators {
  isDateFormat = (property: string, validationOptions?: ValidationOptions) => {
    return (object: unknown, propertyName: string) => {
      registerDecorator({
        name: 'isDateFormat',
        target: object.constructor,
        propertyName,
        constraints: [property],
        options: validationOptions,
        validator: {
          validate(value: string) {
            const regex = /[0-9]{1,2}\/[0-9]{1,2}\/[0-9]{4}/
            return regex.test(value)
          },
        },
      })
    }
  }
}
