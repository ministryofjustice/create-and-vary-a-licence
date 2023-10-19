import _ from 'lodash'
import { AdditionalCondition, BespokeCondition, Licence } from '../@types/licenceApiClientTypes'
import ConditionType from '../enumeration/conditionType'

type Condition = {
  category: string
  condition: string
}

export type VariedConditions = {
  licenceConditionsAdded: Condition[]
  licenceConditionsRemoved: Condition[]
  licenceConditionsAmended: Condition[]
  pssConditionsAdded: Condition[]
  pssConditionsRemoved: Condition[]
  pssConditionsAmended: Condition[]
}

const compareLicenceConditions = (originalLicence: Licence, variation: Licence): VariedConditions => {
  let variedAdditionalLicenceConditions: VariedConditions
  let variedBespokeConditions: VariedConditions
  if (!variation.isInPssPeriod) {
    variedAdditionalLicenceConditions = compareAdditionalConditionSet(
      originalLicence.additionalLicenceConditions,
      variation.additionalLicenceConditions,
      ConditionType.AP
    )
    variedBespokeConditions = compareBespokeConditionSet(originalLicence.bespokeConditions, variation.bespokeConditions)
  }

  const variedAdditionalPssConditions = compareAdditionalConditionSet(
    originalLicence.additionalPssConditions,
    variation.additionalPssConditions,
    ConditionType.PSS
  )

  const combinedLicenceConditions = _.mergeWith(
    variedAdditionalLicenceConditions,
    variedBespokeConditions,
    (objValue, srcValue) => objValue.concat(srcValue)
  )

  return _.merge(combinedLicenceConditions, variedAdditionalPssConditions)
}

const compareAdditionalConditionSet = (
  originalConditionSet: AdditionalCondition[],
  variedConditionSet: AdditionalCondition[],
  conditionType: ConditionType
): VariedConditions => {
  const variedConditionsBuilder = new VariedConditionsBuilder(conditionType)

  const originalConditions = originalConditionSet.reduce(
    (acc, c) => {
      const existingValues = acc[c.code]
      if (existingValues) {
        acc[c.code] = { ...existingValues, expandedText: `${existingValues.expandedText}\n\n${c.expandedText}` }
      } else {
        acc[c.code] = c
      }
      return acc
    },
    {} as Record<string, AdditionalCondition>
  )

  const variedConditions = variedConditionSet.reduce(
    (acc, c) => {
      const existingValues = acc[c.code]
      if (existingValues) {
        acc[c.code] = { ...existingValues, expandedText: `${existingValues.expandedText}\n\n${c.expandedText}` }
      } else {
        acc[c.code] = c
      }
      return acc
    },
    {} as Record<string, AdditionalCondition>
  )

  const sortedOriginalConditions = sortConditionSet(Object.values(originalConditions))
  const sortedVariedConditions = sortConditionSet(Object.values(variedConditions))

  let originalCondition = sortedOriginalConditions.shift()
  let variedCondition = sortedVariedConditions.shift()

  while (originalCondition !== undefined || variedCondition !== undefined) {
    if (originalCondition?.code < variedCondition?.code || variedCondition === undefined) {
      variedConditionsBuilder.recordConditionRemoved({
        category: originalCondition.category,
        condition: originalCondition.expandedText,
      })
      originalCondition = sortedOriginalConditions.shift()
    } else if (originalCondition?.code > variedCondition?.code || originalCondition === undefined) {
      variedConditionsBuilder.recordConditionAdded({
        category: variedCondition.category,
        condition: variedCondition.expandedText,
      })
      variedCondition = sortedVariedConditions.shift()
    } else {
      if (originalCondition.expandedText !== variedCondition.expandedText) {
        variedConditionsBuilder.recordConditionAmended({
          category: variedCondition.category,
          condition: variedCondition.expandedText,
        })
      }

      originalCondition = sortedOriginalConditions.shift()
      variedCondition = sortedVariedConditions.shift()
    }
  }

  return variedConditionsBuilder.buildVariedConditions()
}

const compareBespokeConditionSet = (
  originalConditionSet: BespokeCondition[],
  variedConditionSet: BespokeCondition[]
): VariedConditions => {
  const variedConditionsBuilder = new VariedConditionsBuilder(ConditionType.BESPOKE)
  const sortedOriginalConditionSet = sortBespokeConditionSet(originalConditionSet)
  const sortedVariedConditionSet = sortBespokeConditionSet(variedConditionSet)

  let originalCondition = sortedOriginalConditionSet.shift()
  let variedCondition = sortedVariedConditionSet.shift()

  while (originalCondition || variedCondition) {
    if (originalCondition?.text < variedCondition?.text || variedCondition === undefined) {
      variedConditionsBuilder.recordConditionRemoved({
        category: 'Bespoke condition',
        condition: originalCondition.text,
      })
      originalCondition = sortedOriginalConditionSet.shift()
    } else if (originalCondition?.text > variedCondition?.text || originalCondition === undefined) {
      variedConditionsBuilder.recordConditionAdded({
        category: 'Bespoke condition',
        condition: variedCondition.text,
      })
      variedCondition = sortedVariedConditionSet.shift()
    } else {
      if (originalCondition.text !== variedCondition.text) {
        variedConditionsBuilder.recordConditionAmended({
          category: 'Bespoke condition',
          condition: variedCondition.text,
        })
      }

      originalCondition = sortedOriginalConditionSet.shift()
      variedCondition = sortedVariedConditionSet.shift()
    }
  }

  return variedConditionsBuilder.buildVariedConditions()
}

const sortConditionSet = (conditionSet: AdditionalCondition[]) => {
  return conditionSet.sort((a, b) => {
    if (a.code > b.code) {
      return 1
    }
    return -1
  })
}

const sortBespokeConditionSet = (conditionSet: BespokeCondition[]) => {
  return conditionSet.sort((a, b) => {
    if (a.text > b.text) {
      return 1
    }
    return -1
  })
}

class VariedConditionsBuilder {
  constructor(private readonly conditionType: ConditionType) {}

  private conditonsAdded: Condition[] = []

  private conditonsRemoved: Condition[] = []

  private conditonsAmended: Condition[] = []

  recordConditionAdded = (condition: Condition) => {
    this.conditonsAdded.push(condition)
  }

  recordConditionRemoved = (condition: Condition) => {
    this.conditonsRemoved.push(condition)
  }

  recordConditionAmended = (condition: Condition) => {
    this.conditonsAmended.push(condition)
  }

  buildVariedConditions = (): VariedConditions => {
    if (this.conditionType === 'AP' || this.conditionType === 'Bespoke') {
      return {
        licenceConditionsAdded: this.conditonsAdded,
        licenceConditionsRemoved: this.conditonsRemoved,
        licenceConditionsAmended: this.conditonsAmended,
      } as VariedConditions
    }
    return {
      pssConditionsAdded: this.conditonsAdded,
      pssConditionsRemoved: this.conditonsRemoved,
      pssConditionsAmended: this.conditonsAmended,
    } as VariedConditions
  }
}

export default compareLicenceConditions
