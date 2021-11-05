import conditionsConfig from '../config/conditions'
import LicenceType from '../enumeration/licenceType'
import { AdditionalCondition } from '../@types/licenceApiClientTypes'
import logger from '../../logger'

export function getVersion(): string {
  return conditionsConfig.version
}

export function getStandardConditions(licenceType: string): Record<string, unknown>[] {
  switch (licenceType) {
    case LicenceType.AP:
      return conditionsConfig.standardConditions.AP.map((condition, index) => {
        return {
          ...condition,
          sequence: index,
        }
      })
    default:
      throw new Error(`No licence type found with code : '${licenceType}'`)
  }
}

export function getAdditionalConditionByCode(code: string): Record<string, unknown> {
  return conditionsConfig.additionalConditions.find(config => config.code === code)
}

export function getGroupedAdditionalConditions(): Record<string, unknown>[] {
  const map = new Map()
  conditionsConfig.additionalConditions.forEach(condition => {
    const collection = map.get(condition.category)
    if (!collection) {
      map.set(condition.category, [condition])
    } else {
      collection.push(condition)
    }
  })
  return Array.from(map, ([category, conditions]) => ({ category, conditions }))
}

export async function expandAdditionalConditions(conditions: AdditionalCondition[]): Promise<string[]> {
  const expandedConditions: string[] = []

  conditions.forEach(condition => {
    const configCondition = getAdditionalConditionByCode(condition.code)

    if (configCondition.requiresInput) {
      const numberOfPlaceholders = condition.text.match(/\[(.*?)]/g)?.length || 0
      const numberOfValues = condition.data?.length || 0

      if (numberOfValues === numberOfPlaceholders) {
        // When there is an equal number of placeholders and data items, perform a straight replacement regardless of type
        expandedConditions.push(replacePlaceholdersWithValues(condition))
      } else {
        // Mismatched numbers of values and placeholders - treat each case by type OR add a more descriptive .template to the condition?
        // Could be multiple data items specified for one placeholder - CHECKBOX or multiple text fields into one placeholder concatenated.
        // Could be optional values not supplied - how to tell?
        // Could be capitalised replacement values eg. West Ruislip, or lowercase like 'any child' - how to tell?
        // Add rules for multiple items, comma-separated with an ' and ' between penultimate and last items. (e.g. drugs, violence and alchohol)
      }
    } else {
      // No input required - keep the text verbatim.
      expandedConditions.push(condition.text)
    }
  })
  return expandedConditions
}

const replacePlaceholdersWithValues = (condition: AdditionalCondition): string => {
  let counter = 0
  logger.info(`Condition b4: ${condition.text}`)
  const expandedText = condition.text.replace(/\[(.*?)]/g, (instance: string): string => {
    const field = condition.data[counter]?.value || 'unspecified'
    counter += 1
    return field
  })
  logger.info(`Condition after: ${expandedText}`)
  return expandedText
}
