import { registerDecorator, ValidationOptions } from 'class-validator'

export default function HasAtLeastOne(validationOptions?: ValidationOptions) {
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

function hasAtLeastOne(value: string[]) {
  return value?.filter(v => v).length > 0
}
