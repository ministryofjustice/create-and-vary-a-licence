import conditionsConfig from '../config/conditions'
import { AdditionalConditionData } from '../@types/licenceApiClientTypes'
import { convertToTitleCase, formatAddress } from './utils'
import LicenceType from '../enumeration/licenceType'
import InputTypes from '../enumeration/inputTypes'

export function getVersion(): string {
  return conditionsConfig.version
}

export function getStandardConditions(licenceType: string): Record<string, unknown>[] {
  return conditionsConfig.standardConditions[licenceType].map((condition: Record<string, unknown>, index: number) => {
    return {
      ...condition,
      sequence: index,
    }
  })
}

export function getAdditionalConditionByCode(searchCode: string): Record<string, unknown> {
  return Object.values(conditionsConfig.additionalConditions)
    .flat()
    .find(({ code }) => code === searchCode)
}

export function getAdditionalConditionType(searchCode: string): LicenceType {
  if (
    Object.values(conditionsConfig.additionalConditions.AP)
      .flat()
      .find(({ code }) => code === searchCode)
  ) {
    return LicenceType.AP
  }

  return LicenceType.PSS
}

export function getGroupedAdditionalConditions(licenceType: LicenceType): Record<string, unknown>[] {
  const map = new Map()
  conditionsConfig.additionalConditions[licenceType].forEach((condition: Record<string, unknown>) => {
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
 * Accepts an additional condition and data items for a licence and expands the
 * placeholders with their matching data to produce a formatted additional condition.
 * @param conditionCode
 * @param enteredData
 */
export function expandAdditionalCondition(conditionCode: string, enteredData: AdditionalConditionData[]): string {
  const configCondition = getAdditionalConditionByCode(conditionCode)

  if (configCondition?.requiresInput) {
    const placeholders = getPlaceholderNames(configCondition.tpl as string)
    const inputConfig = getConditionInputs(configCondition)
    let conditionText = configCondition.tpl as string

    placeholders.forEach(placeholder => {
      const ph = placeholder.replace(/[{}]/g, '')?.trim()

      // Double pipe notation is used to indicate that either value can be used in this placeholder.
      // The field names are in priority order (i.e. the second field name will be used only if the first field has no data)

      const fieldName =
        ph
          .split('||')
          .map(p => p.trim())
          .find(p => getMatchingDataItems(p, enteredData).length > 0) || ph

      const matchingDataItems = getMatchingDataItems(fieldName, enteredData)

      if (matchingDataItems.length === 0) {
        // Unmatched placeholder
        conditionText = removeNamedPlaceholder(ph, conditionText)
      } else if (matchingDataItems.length === 1) {
        // Single matching value
        const rules = inputConfig.find(item => item.name === fieldName)
        let { value } = matchingDataItems[0]
        value = adjustCase(rules?.case as string, value)
        value = rules?.includeBefore ? `${rules.includeBefore}${value}` : `${value}`
        value = rules?.type === InputTypes.ADDRESS ? formatAddress(value) : value
        if (rules?.handleIndefiniteArticle) {
          value = startsWithAVowel(value) ? `an ${value}` : `a ${value}`
        }
        conditionText = replacePlaceholderWithValue(ph, conditionText, value)
      } else {
        // List of values for this placeholder (lists of values can have listType 'AND' or 'OR')
        const rules = inputConfig.find(item => item.name === fieldName)
        let value = produceValueAsFormattedList(rules?.listType as string, matchingDataItems)
        value = adjustCase(rules?.case as string, value)
        value = rules?.includeBefore ? `${rules.includeBefore}${value}` : `${value}`
        if (rules?.handleIndefiniteArticle) {
          value = startsWithAVowel(value) ? `an ${value}` : `a ${value}`
        }
        conditionText = replacePlaceholderWithValue(ph, conditionText, value)
      }
    })

    // Remove any unmatched placeholders that remain
    return removeAllPlaceholders(conditionText)
  }
  // No input was required - keep the condition verbatim to print on the licence
  return configCondition.text as string
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
 * Checks whether the first letter of a string value starts with a vowel.
 * @param value
 */
const startsWithAVowel = (value: string): boolean => {
  const regex = new RegExp('^[aeiou].*', 'i')
  return value && regex.test(value.trim())
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
  if (!caseRule) {
    return value
  }
  switch (caseRule.toLowerCase()) {
    case 'lower':
      return value.toLowerCase()
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

const getConditionInputs = (conditionConfig: Record<string, unknown>): Record<string, unknown>[] => {
  if (!conditionConfig) {
    return []
  }

  // Since inputs can be within inputs (i.e. radio button which reveals another textbox underneath), we have to
  // recursively build a list of inputs by going deep into the layers

  const topLevelInputs = conditionConfig.inputs as unknown as Record<string, unknown>[]
  const inputOptions = topLevelInputs.flatMap(input => input.options) as unknown as Record<string, unknown>[]
  const deeperLevelInputs =
    inputOptions
      .filter(option => option && option.conditional)
      ?.map(opt => {
        return opt.conditional as unknown as Record<string, unknown>
      })
      .flatMap(config => getConditionInputs(config)) || []

  return [...topLevelInputs, ...deeperLevelInputs]
}
