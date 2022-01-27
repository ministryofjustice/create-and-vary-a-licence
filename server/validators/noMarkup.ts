import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator'

// Not currently used - here as an example validator only - may removed in future.

export default function NoMarkup(validationOptions?: ValidationOptions) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const noMarkup = (value: string, { object }: ValidationArguments) => {
    return !(value.includes('<') || value.includes('>'))
  }

  return (object: unknown, propertyName: string) => {
    registerDecorator({
      name: 'noMarkup',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: { validate: noMarkup },
    })
  }
}
