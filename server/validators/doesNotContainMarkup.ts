import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator'

export default function DoesNotContainMarkup(validationOptions?: ValidationOptions) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
