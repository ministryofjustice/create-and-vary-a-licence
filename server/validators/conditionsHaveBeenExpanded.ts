import { registerDecorator, ValidationOptions } from 'class-validator'
import { AdditionalCondition } from '../@types/licenceApiClientTypes'
import { getAdditionalConditionByCode } from '../utils/conditionsProvider'

export default function ConditionsHaveBeenExpanded(validationOptions?: ValidationOptions) {
  const conditionsAreExpanded = (conditions: AdditionalCondition[]) => {
    return (
      conditions.filter(c => {
        const conditionConfig = getAdditionalConditionByCode(c.code)
        return conditionConfig.requiresInput && c.data.length === 0
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
