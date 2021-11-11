import conditionsConfig from '../config/conditions'
import LicenceType from '../enumeration/licenceType'
import { AdditionalCondition, AdditionalConditionData } from '../@types/licenceApiClientTypes'
import { convertToTitleCase } from './utils'

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

export function getAdditionalConditionByCode(searchCode: string): Record<string, unknown> {
  return conditionsConfig.additionalConditions.find(({ code }) => code === searchCode)
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

/**
 * Accepts a list of additional conditions and data items for a licence and expands the
 * placeholders with their matching data to produce a list of formatted additional conditions.
 * @param conditions
 */
export function expandAdditionalConditions(conditions: AdditionalCondition[]): string[] {
  const expandedConditions: string[] = []
  conditions?.forEach(condition => {
    const configCondition = getAdditionalConditionByCode(condition.code)

    if (configCondition?.requiresInput) {
      const placeholders = getPlaceholderNames(configCondition.tpl as string)
      const inputConfig = configCondition.inputs as unknown as Record<string, unknown>[]
      let conditionText = configCondition.tpl as string

      placeholders.forEach(placeholder => {
        const ph = placeholder.replace(/[{}]/g, '')?.trim()
        const matchingDataItems = getMatchingDataItems(ph, condition.data)

        if (matchingDataItems.length === 0) {
          // Unmatched placeholder
          conditionText = removeNamedPlaceholder(ph, conditionText)
        } else if (matchingDataItems.length === 1) {
          // Single matching value
          const rules = inputConfig.find(item => item.name === ph)
          let { value } = matchingDataItems[0]
          value = adjustCase(rules.case as string, value)
          value = rules?.includeBefore ? `${rules.includeBefore}${value}` : `${value}`
          conditionText = replacePlaceholderWithValue(ph, conditionText, value)
        } else {
          // List of values for this placeholder (lists of values can have listType 'AND' or 'OR')
          const rules = inputConfig.find(item => item.name === ph)
          let value = produceValueAsFormattedList(rules?.listType as string, matchingDataItems)
          value = adjustCase(rules.case as string, value)
          value = rules?.includeBefore ? `${rules.includeBefore}${value}` : `${value}`
          conditionText = replacePlaceholderWithValue(ph, conditionText, value)
        }
      })

      // Remove any unmatched placeholders that remain
      conditionText = removeAllPlaceholders(conditionText)
      expandedConditions.push(conditionText)
    } else {
      // No input was required - keep the condition text verbatim to print on the licence
      expandedConditions.push(condition.text)
    }
  })

  return expandedConditions
}

/**
 * Formats a list of data items according to rules (add commas, 'and' or 'or')
 * @param listType - either null, AND or OR - treat null as an AND
 * @param matchingDataItems
 */
export const produceValueAsFormattedList = (listType = 'AND', matchingDataItems: AdditionalConditionData[]): string => {
  let value = ''
  let valueCounter = 1
  matchingDataItems.forEach(mdi => {
    if (valueCounter < matchingDataItems.length - 1) {
      value = value.concat(`${mdi.value}, `)
    } else if (valueCounter === matchingDataItems.length - 1) {
      value = listType && listType === 'OR' ? value.concat(`${mdi.value} or `) : value.concat(`${mdi.value} and `)
    } else {
      value = value.concat(`${mdi.value}`)
    }
    valueCounter += 1
  })
  return value
}

/**
 * Returns a list of all the placeholder names (including {} around) that exist in a template.
 * @param template
 */
const getPlaceholderNames = (template: string): string[] => {
  return template.match(/{(.*?)}/g) || []
}

/**
 * Replaces a named placeholder in a template with the value provided.
 * @param ph
 * @param template
 * @param value
 */
const replacePlaceholderWithValue = (ph: string, template: string, value: string): string => {
  return template.replace(`{${ph}}`, (): string => {
    return value
  })
}

/**
 * Removes a specific placeholder from a template.
 * @param ph
 * @param template
 */
const removeNamedPlaceholder = (ph: string, template: string): string => {
  return template.replace(`{${ph}}`, (): string => {
    return ''
  })
}

/**
 * Removes all remaining placeholders from a template.
 * @param template
 */
const removeAllPlaceholders = (template: string): string => {
  return template.replace(/\{(.*?)}/g, (): string => {
    return ''
  })
}

/**
 * Adjusts the case of a value according to the rule specified.
 * @param caseRule
 * @param value
 */
const adjustCase = (caseRule: string, value: string): string => {
  switch (caseRule?.toLowerCase()) {
    case 'lower':
      return value.toLowerCase()
      break
    case 'upper':
      return value.toUpperCase()
    case 'capitalised':
      return convertToTitleCase(value)
    default:
      return value
  }
}

/**
 * Returns a list of data items which match the placeholder name provided.
 * @param placeholder
 * @param conditionData
 */
const getMatchingDataItems = (
  placeholder: string,
  conditionData: AdditionalConditionData[]
): AdditionalConditionData[] => {
  return conditionData.filter((cd: AdditionalConditionData) => cd.field === placeholder) || []
}
