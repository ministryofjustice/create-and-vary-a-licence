import { registerDecorator, ValidationOptions } from 'class-validator'
import { AdditionalCondition } from '../@types/licenceApiClientTypes'

export default function ConditionsHaveBeenExpanded(validationOptions?: ValidationOptions) {
  const conditionsAreExpanded = (conditions: AdditionalCondition[]) => {
    return (
      conditions.filter(c => {
        return !c.readyToSubmit
      }).length === 0
    )
  }

  return (object: unknown, propertyName: string) => {
    registerDecorator({
      name: 'conditionsAreExpanded',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: { validate: conditionsAreExpanded },
    })
  }
}
