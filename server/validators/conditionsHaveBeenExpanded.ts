import { registerDecorator, ValidationOptions } from 'class-validator'
import { AdditionalCondition } from '../@types/licenceApiClientTypes'

export default function ConditionsHaveBeenExpanded(validationOptions?: ValidationOptions) {
  const conditionsAreExpanded = (conditions: AdditionalCondition[]) => {
    return (
      conditions.filter(c => {
        // TODO: Fix this bodge. I couldn't find a way to access the ConditionService to be able
        // to read the requiresInput field of a condition. This bodge checks for an opening square
        // brace, which is only used in condition text to indicate required input.
        return c.text.includes('[') && c.data.length === 0
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
