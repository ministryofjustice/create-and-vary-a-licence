import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator'

export default function DoesNotContainMarkup(validationOptions?: ValidationOptions) {
  const doesNotContainMarkup = (value: string, { object }: ValidationArguments) => {
    return !(value.includes('<') || value.includes('>'))
  }

  return (object: unknown, propertyName: string) => {
    registerDecorator({
      name: 'doesNotContainMarkup',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: { validate: doesNotContainMarkup },
    })
  }
}
