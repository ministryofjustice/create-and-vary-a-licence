import _ from 'lodash'
import {
  AdditionalCondition,
  BespokeCondition,
  CurfewTimes,
  HdcCurfewAddress,
  Licence,
} from '../@types/licenceApiClientTypes'
import ConditionType from '../enumeration/conditionType'
import { groupingBy } from './utils'

type ImageUploadSummary = {
  text: string
  description: string
  thumbnailImage: string
}

type ConditionAndImageUploads = AdditionalCondition & {
  expandedText: string
  uploadSummaries: ImageUploadSummary[]
}

type VariedAdditionalCondition = {
  category: string
  condition: string
  uploadSummaries: ImageUploadSummary[]
}

type VariedBespokeCondition = {
  category: string
  condition: string
}

type Condition = VariedAdditionalCondition | VariedBespokeCondition

export type VariedConditions = {
  licenceConditionsAdded: Condition[]
  licenceConditionsRemoved: Condition[]
  licenceConditionsAmended: Condition[]
  pssConditionsAdded: Condition[]
  pssConditionsRemoved: Condition[]
  pssConditionsAmended: Condition[]
}

export type VariationChanges = VariedConditions & {
  hasUpdatedCurfewAddress: boolean
  hasUpdatedCurfewHours: boolean
}

const compareLicenceConditions = (originalLicence: Licence, variation: Licence): VariedConditions => {
  let variedAdditionalLicenceConditions: VariedConditions
  let variedBespokeConditions: VariedConditions
  if (!variation.isInPssPeriod) {
    variedAdditionalLicenceConditions = compareAdditionalConditionSet(
      originalLicence.additionalLicenceConditions,
      variation.additionalLicenceConditions,
      ConditionType.AP,
    )
    variedBespokeConditions = compareBespokeConditionSet(originalLicence.bespokeConditions, variation.bespokeConditions)
  }

  const variedAdditionalPssConditions = compareAdditionalConditionSet(
    originalLicence.additionalPssConditions,
    variation.additionalPssConditions,
    ConditionType.PSS,
  )

  const combinedLicenceConditions = _.mergeWith(
    variedAdditionalLicenceConditions,
    variedBespokeConditions,
    (objValue, srcValue) => objValue.concat(srcValue),
  )

  return _.merge(combinedLicenceConditions, variedAdditionalPssConditions)
}

const createConditionAndUploads = (additionalCondition: AdditionalCondition) => {
  if (additionalCondition.uploadSummary.length !== 0) {
    return {
      text: additionalCondition.text,
      description: additionalCondition.uploadSummary[0].description,
      thumbnailImage: additionalCondition.uploadSummary[0].thumbnailImage,
    }
  }
  return undefined
}

const compareAdditionalConditionSet = (
  originalConditionSet: AdditionalCondition[],
  variedConditionSet: AdditionalCondition[],
  conditionType: ConditionType,
): VariedConditions => {
  const variedConditionsBuilder = new VariedConditionsBuilder(conditionType)

  console.log('originalConditionSet', originalConditionSet)
  console.log('variedConditionSet', variedConditionSet)

  const originalConditions: ConditionAndImageUploads[] = groupingBy(originalConditionSet, 'code').map(
    ([first, ...rest]) => {
      const texts = [first.expandedText, ...rest.map(r => r.expandedText)]
      return {
        ...first,
        expandedText: texts.join('\n\n'),
        ...(first.uploadSummary.length !== 0 && {
          uploadSummaries: [createConditionAndUploads(first), ...rest.map(createConditionAndUploads)],
        }),
      }
    },
  )

  const variedConditions = groupingBy(variedConditionSet, 'code').map(([first, ...rest]) => {
    const texts = [first.expandedText, ...rest.map(r => r.expandedText)]
    return {
      ...first,
      expandedText: texts.join('\n\n'),
      ...(first.uploadSummary.length !== 0 && {
        uploadSummaries: [createConditionAndUploads(first), ...rest.map(createConditionAndUploads)],
      }),
    }
  })

  console.log('originalConditions', originalConditions)
  const sortedOriginalConditions: ConditionAndImageUploads[] = sortConditionSet(Object.values(originalConditions))
  const sortedVariedConditions = sortConditionSet(Object.values(variedConditions))

  console.log('sortedVariedConditions', sortedVariedConditions)

  let originalCondition: ConditionAndImageUploads = sortedOriginalConditions.shift()
  let variedCondition = sortedVariedConditions.shift()

  while (originalCondition !== undefined || variedCondition !== undefined) {
    if (originalCondition?.code < variedCondition?.code || variedCondition === undefined) {
      variedConditionsBuilder.recordConditionRemoved({
        category: originalCondition.category,
        condition: originalCondition.expandedText,
        uploadSummaries: originalCondition.uploadSummaries,
      })
      originalCondition = sortedOriginalConditions.shift()
    } else if (originalCondition?.code > variedCondition?.code || originalCondition === undefined) {
      variedConditionsBuilder.recordConditionAdded({
        category: variedCondition.category,
        condition: variedCondition.expandedText,
        uploadSummaries: variedCondition.uploadSummaries,
      })
      variedCondition = sortedVariedConditions.shift()
    } else {
      if (originalCondition.expandedText !== variedCondition.expandedText) {
        variedConditionsBuilder.recordConditionAmended({
          category: variedCondition.category,
          condition: variedCondition.expandedText,
          uploadSummaries: variedCondition.uploadSummaries,
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
  variedConditionSet: BespokeCondition[],
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

const sortConditionSet = (conditionSet: ConditionAndImageUploads[]) => {
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

const hasUpdatedCurfewAddress = (originalAddress: HdcCurfewAddress, variedAddress: HdcCurfewAddress) => {
  console.log('originalAddress', originalAddress)
  console.log('variedAddress', variedAddress)
  return (
    originalAddress.firstLine !== variedAddress.firstLine ||
    originalAddress.secondLine !== variedAddress.secondLine ||
    originalAddress.county !== variedAddress.county ||
    originalAddress.postcode !== variedAddress.postcode ||
    originalAddress.townOrCity !== variedAddress.townOrCity
  )
}

const hasUpdatedCurfewHours = (originalCurfewHours: CurfewTimes[], variedCurfewHours: CurfewTimes[]) => {
  return originalCurfewHours.some(curfew => {
    const variedCurfew = variedCurfewHours.find(v => v.curfewTimesSequence === curfew.curfewTimesSequence)
    return (
      curfew.fromTime !== variedCurfew.fromTime ||
      curfew.untilTime !== variedCurfew.untilTime ||
      curfew.fromDay !== variedCurfew.fromDay ||
      curfew.untilDay !== variedCurfew.untilDay
    )
  })
}

class VariedConditionsBuilder {
  constructor(private readonly conditionType: ConditionType) {}

  private conditionsAdded: Condition[] = []

  private conditionsRemoved: Condition[] = []

  private conditionsAmended: Condition[] = []

  recordConditionAdded = (condition: Condition) => {
    this.conditionsAdded.push(condition)
  }

  recordConditionRemoved = (condition: Condition) => {
    this.conditionsRemoved.push(condition)
  }

  recordConditionAmended = (condition: Condition) => {
    this.conditionsAmended.push(condition)
  }

  buildVariedConditions = (): VariedConditions => {
    if (this.conditionType === 'AP' || this.conditionType === 'Bespoke') {
      return {
        licenceConditionsAdded: this.conditionsAdded,
        licenceConditionsRemoved: this.conditionsRemoved,
        licenceConditionsAmended: this.conditionsAmended,
      } as VariedConditions
    }
    return {
      pssConditionsAdded: this.conditionsAdded,
      pssConditionsRemoved: this.conditionsRemoved,
      pssConditionsAmended: this.conditionsAmended,
    } as VariedConditions
  }
}

export { compareLicenceConditions, hasUpdatedCurfewAddress, hasUpdatedCurfewHours }
