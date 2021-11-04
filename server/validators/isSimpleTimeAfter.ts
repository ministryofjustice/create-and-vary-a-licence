import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator'
import SimpleTime from '../routes/creatingLicences/types/time'

export default function IsSimpleTimeAfter(property: string, validationOptions?: ValidationOptions) {
  return (object: unknown, propertyName: string) => {
    registerDecorator({
      name: 'isSimpleTimeAfter',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: SimpleTime, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints
          const relatedValue = (args.object as SimpleTime)[relatedPropertyName]
          return (
            value instanceof SimpleTime &&
            relatedValue instanceof SimpleTime &&
            value.toMoment().isAfter(relatedValue.toMoment())
          )
        },
      },
    })
  }
}
