import {
  AdditionalConditionAp,
  AdditionalConditionData,
  AdditionalConditionPss,
  Input,
} from '../@types/licenceApiClientTypes'
import { convertToTitleCase, formatAddress } from '../utils/utils'
import InputTypes from '../enumeration/inputTypes'

export default class ConditionFormatter {
  /**
   * Accepts an additional condition and data items for a licence and expands the
   * placeholders with their matching data to produce a formatted additional condition.
   * @param conditionCode
   * @param enteredData
   */
  public async format(
    configCondition: AdditionalConditionAp | AdditionalConditionPss,
    enteredData: AdditionalConditionData[]
  ): Promise<string> {
    if (configCondition?.requiresInput) {
      const placeholders = this.getPlaceholderNames(configCondition.tpl as string)
      const inputConfig = this.getConditionInputs(configCondition)
      let conditionText = configCondition.tpl as string

      placeholders.forEach(placeholder => {
        const ph = placeholder.replace(/[{}]/g, '')?.trim()

        // Double pipe notation is used to indicate that either value can be used in this placeholder.
        // The field names are in priority order (i.e. the second field name will be used only if the first field has no data)

        const fieldName =
          ph
            .split('||')
            .map(p => p.trim())
            .find(p => this.getMatchingDataItems(p, enteredData).length > 0) || ph

        const matchingDataItems = this.getMatchingDataItems(fieldName, enteredData)

        if (matchingDataItems.length === 0) {
          // Unmatched placeholder
          conditionText = this.removeNamedPlaceholder(ph, conditionText)
        } else if (matchingDataItems.length === 1) {
          // Single matching value
          const rules = inputConfig.find(item => item.name === fieldName)
          let { value } = matchingDataItems[0]
          value = this.adjustCase(rules?.case as string, value)
          value = rules?.includeBefore ? `${rules.includeBefore}${value}` : `${value}`
          value = rules?.type === InputTypes.ADDRESS ? formatAddress(value) : value
          if (rules?.handleIndefiniteArticle) {
            value = this.startsWithAVowel(value) ? `an ${value}` : `a ${value}`
          }
          conditionText = this.replacePlaceholderWithValue(ph, conditionText, value)
        } else {
          // List of values for this placeholder (lists of values can have listType 'AND' or 'OR')
          const rules = inputConfig.find(item => item.name === fieldName)
          let value = this.produceValueAsFormattedList(rules?.listType as string, matchingDataItems)
          value = this.adjustCase(rules?.case as string, value)
          value = rules?.includeBefore ? `${rules.includeBefore}${value}` : `${value}`
          if (rules?.handleIndefiniteArticle) {
            value = this.startsWithAVowel(value) ? `an ${value}` : `a ${value}`
          }
          conditionText = this.replacePlaceholderWithValue(ph, conditionText, value)
        }
      })

      // Remove any unmatched placeholders that remain
      return this.removeAllPlaceholders(conditionText)
    }
    // No input was required - keep the condition verbatim to print on the licence
    return configCondition.text as string
  }

  /**
   * Formats a list of data items according to rules (add commas, 'and' or 'or')
   * @param listType - either null, AND or OR - treat null as an AND
   * @param matchingDataItems
   */
  private produceValueAsFormattedList = (listType = 'AND', matchingDataItems: AdditionalConditionData[]): string => {
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
  private startsWithAVowel = (value: string): boolean => {
    const regex = new RegExp('^[aeiou].*', 'i')
    return value && regex.test(value.trim())
  }

  /**
   * Returns a list of all the placeholder names (including {} around) that exist in a template.
   * @param template
   */
  private getPlaceholderNames = (template: string): string[] => {
    return template.match(/{(.*?)}/g) || []
  }

  /**
   * Replaces a named placeholder in a template with the value provided.
   * @param ph
   * @param template
   * @param value
   */
  private replacePlaceholderWithValue = (ph: string, template: string, value: string): string => {
    return template.replace(`{${ph}}`, (): string => {
      return value
    })
  }

  /**
   * Removes a specific placeholder from a template.
   * @param ph
   * @param template
   */
  private removeNamedPlaceholder = (ph: string, template: string): string => {
    return template.replace(`{${ph}}`, (): string => {
      return ''
    })
  }

  /**
   * Removes all remaining placeholders from a template.
   * @param template
   */
  private removeAllPlaceholders = (template: string): string => {
    return template.replace(/\{(.*?)}/g, (): string => {
      return ''
    })
  }

  /**
   * Adjusts the case of a value according to the rule specified.
   * @param caseRule
   * @param value
   */
  private adjustCase = (caseRule: string, value: string): string => {
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
  private getMatchingDataItems = (
    placeholder: string,
    conditionData: AdditionalConditionData[]
  ): AdditionalConditionData[] => {
    return conditionData.filter((cd: AdditionalConditionData) => cd.field === placeholder) || []
  }

  private getConditionInputs = (
    conditionConfig: AdditionalConditionAp | AdditionalConditionPss | { inputs: Input[] }
  ): Input[] => {
    if (!conditionConfig) {
      return []
    }

    // Since inputs can be within inputs (i.e. radio button which reveals another textbox underneath), we have to
    // recursively build a list of inputs by going deep into the layers

    const topLevelInputs = conditionConfig.inputs as Input[]
    const inputOptions = topLevelInputs.flatMap(input => input.options) as Input['options']
    const deeperLevelInputs =
      inputOptions
        .filter(option => option && option.conditional)
        ?.map(opt => {
          return opt.conditional as { inputs: Input[] }
        })
        .flatMap(config => this.getConditionInputs(config)) || []

    return [...topLevelInputs, ...deeperLevelInputs]
  }
}
