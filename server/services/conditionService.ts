import LicenceApiClient from '../data/licenceApiClient'
import RegionOfResidence from '../routes/creatingLicences/types/additionalConditionInputs/regionOfResidence'
import RestrictionOfResidency from '../routes/creatingLicences/types/additionalConditionInputs/restrictionOfResidency'
import MedicalAppointmentType from '../routes/creatingLicences/types/additionalConditionInputs/medicalAppointmentType'
import UnsupervisedContact from '../routes/creatingLicences/types/additionalConditionInputs/unsupervisedContact'
import WorkingWithChildren from '../routes/creatingLicences/types/additionalConditionInputs/workingWithChildren'
import IntimateRelationshipWithGender from '../routes/creatingLicences/types/additionalConditionInputs/intimateRelationshipWithGender'
import BehaviourProblems from '../routes/creatingLicences/types/additionalConditionInputs/behaviourProblems'
import AppointmentTimeAndPlace from '../routes/creatingLicences/types/additionalConditionInputs/appointmentTimeAndPlace'
import OutOfBoundsRegion from '../routes/creatingLicences/types/additionalConditionInputs/outOfBoundsRegion'
import OutOfBoundsPremises from '../routes/creatingLicences/types/additionalConditionInputs/outOfBoundsPremises'
import OutOfBoundsPremisesType from '../routes/creatingLicences/types/additionalConditionInputs/outOfBoundsPremisesType'
import DrugTestLocation from '../routes/creatingLicences/types/additionalConditionInputs/drugTestLocation'
import ElectronicMonitoringTypes from '../routes/creatingLicences/types/additionalConditionInputs/electronicMonitoringTypes'
import ElectronicMonitoringPeriod from '../routes/creatingLicences/types/additionalConditionInputs/electronicMonitoringPeriod'
import ApprovedAddress from '../routes/creatingLicences/types/additionalConditionInputs/approvedAddress'
import AlcoholMonitoringPeriod from '../routes/creatingLicences/types/additionalConditionInputs/alcoholMonitoringPeriod'
import CurfewTerms from '../routes/creatingLicences/types/additionalConditionInputs/curfewTerms'
import CurfewAddress from '../routes/creatingLicences/types/additionalConditionInputs/curfewAddress'
import NoContactWithVictim from '../routes/creatingLicences/types/additionalConditionInputs/noContactWithVictim'
import ReportToApprovedPremises from '../routes/creatingLicences/types/additionalConditionInputs/reportToApprovedPremises'
import SpecifiedItem from '../routes/creatingLicences/types/additionalConditionInputs/specifiedItem'
import NamedIndividuals from '../routes/creatingLicences/types/additionalConditionInputs/namedIndividuals'
import NamedOrganisation from '../routes/creatingLicences/types/additionalConditionInputs/namedOrganisation'
import ReportToPoliceStation from '../routes/creatingLicences/types/additionalConditionInputs/reportToPoliceStation'
import AppointmentTimeAndPlaceDuringPss from '../routes/creatingLicences/types/additionalConditionInputs/appointmentTimeAndPlaceDuringPss'
import LicenceType from '../enumeration/licenceType'
import {
  AdditionalCondition,
  AdditionalConditionAp,
  AdditionalConditionData,
  AdditionalConditionPss,
  Input,
  LicencePolicy,
  StandardCondition,
} from '../@types/licenceApiClientTypes'
import { convertToTitleCase, formatAddress } from '../utils/utils'
import InputTypes from '../enumeration/inputTypes'
import ElectronicTagPeriod from '../routes/creatingLicences/types/additionalConditionInputs/electronicTagPeriod'

export default class ConditionService {
  constructor(private readonly licenceApiClient: LicenceApiClient) {}

  async getVersion(): Promise<string> {
    return (await this.getActiveConditions()).version
  }

  async getStandardConditions(licenceType: string, version: string = null): Promise<StandardCondition[]> {
    let conditions: LicencePolicy
    if (version) {
      conditions = await this.getConditions(version)
    } else {
      conditions = await this.getActiveConditions()
    }
    return conditions.standardConditions[licenceType].map((condition: StandardCondition, index: number) => {
      return {
        ...condition,
        sequence: index,
      }
    })
  }

  async getAdditionalConditionByCode(
    searchCode: string,
    version: string = null
  ): Promise<AdditionalConditionAp | AdditionalConditionPss> {
    let conditions: LicencePolicy
    if (version) {
      conditions = await this.getConditions(version)
    } else {
      conditions = await this.getActiveConditions()
    }
    return Object.values(conditions.additionalConditions)
      .flat()
      .find(({ code }) => code === searchCode)
  }

  async getGroupedAdditionalConditions(
    licenceType: string,
    version: string = null
  ): Promise<{ category: string; conditions: AdditionalConditionAp[] | AdditionalConditionPss[] }[]> {
    let policyConditions: LicencePolicy
    if (version) {
      policyConditions = await this.getConditions(version)
    } else {
      policyConditions = await this.getActiveConditions()
    }
    const map = new Map()
    policyConditions.additionalConditions[licenceType].forEach(
      (condition: AdditionalConditionAp | AdditionalConditionPss) => {
        const collection = map.get(condition.category)
        if (!collection) {
          map.set(condition.category, [condition])
        } else {
          collection.push(condition)
        }
      }
    )
    return Array.from(map, ([category, conditions]) => ({ category, conditions }))
  }

  async getAdditionalConditionType(searchCode: string, version: string = null): Promise<LicenceType> {
    let conditions: LicencePolicy
    if (version) {
      conditions = await this.getConditions(version)
    } else {
      conditions = await this.getActiveConditions()
    }
    if (
      Object.values(conditions.additionalConditions.AP)
        .flat()
        .find(({ code }) => code === searchCode)
    ) {
      return LicenceType.AP
    }
    if (
      Object.values(conditions.additionalConditions.PSS)
        .flat()
        .find(({ code }) => code === searchCode)
    ) {
      return LicenceType.PSS
    }

    return null
  }

  /**
   * Accepts an additional condition and data items for a licence and expands the
   * placeholders with their matching data to produce a formatted additional condition.
   * @param conditionCode
   * @param enteredData
   */
  async expandAdditionalCondition(
    conditionCode: string,
    enteredData: AdditionalConditionData[],
    licenceVersion: string
  ): Promise<string> {
    const configCondition = await this.getAdditionalConditionByCode(conditionCode, licenceVersion)

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

  currentOrNextSequenceForCondition(conditions: AdditionalCondition[], conditionCode: string): number {
    const existingConditionWithType = conditions.find((c: AdditionalCondition) => c.code === conditionCode)
    if (existingConditionWithType) {
      return existingConditionWithType.sequence
    }
    const conditionsBySequence = conditions.sort((a, b) => a.sequence - b.sequence)
    return conditionsBySequence.length ? conditionsBySequence.pop().sequence + 1 : 1
  }

  additionalConditionsCollection(conditions: AdditionalCondition[]) {
    const conditionsWithUploads = conditions.filter(
      (condition: AdditionalCondition) => condition?.uploadSummary?.length > 0
    )
    const additionalConditions = conditions.filter(
      (c: AdditionalCondition) => !conditionsWithUploads.find((c2: AdditionalCondition) => c.id === c2.id)
    )
    return { conditionsWithUploads, additionalConditions }
  }

  /**
   * Formats a list of data items according to rules (add commas, 'and' or 'or')
   * @param listType - either null, AND or OR - treat null as an AND
   * @param matchingDataItems
   */
  produceValueAsFormattedList = (listType = 'AND', matchingDataItems: AdditionalConditionData[]): string => {
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
  startsWithAVowel = (value: string): boolean => {
    const regex = new RegExp('^[aeiou].*', 'i')
    return value && regex.test(value.trim())
  }

  /**
   * Returns a list of all the placeholder names (including {} around) that exist in a template.
   * @param template
   */
  getPlaceholderNames = (template: string): string[] => {
    return template.match(/{(.*?)}/g) || []
  }

  /**
   * Replaces a named placeholder in a template with the value provided.
   * @param ph
   * @param template
   * @param value
   */
  replacePlaceholderWithValue = (ph: string, template: string, value: string): string => {
    return template.replace(`{${ph}}`, (): string => {
      return value
    })
  }

  /**
   * Removes a specific placeholder from a template.
   * @param ph
   * @param template
   */
  removeNamedPlaceholder = (ph: string, template: string): string => {
    return template.replace(`{${ph}}`, (): string => {
      return ''
    })
  }

  /**
   * Removes all remaining placeholders from a template.
   * @param template
   */
  removeAllPlaceholders = (template: string): string => {
    return template.replace(/\{(.*?)}/g, (): string => {
      return ''
    })
  }

  /**
   * Adjusts the case of a value according to the rule specified.
   * @param caseRule
   * @param value
   */
  adjustCase = (caseRule: string, value: string): string => {
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
  getMatchingDataItems = (placeholder: string, conditionData: AdditionalConditionData[]): AdditionalConditionData[] => {
    return conditionData.filter((cd: AdditionalConditionData) => cd.field === placeholder) || []
  }

  getConditionInputs = (
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

  async getConditions(version: string): Promise<LicencePolicy> {
    const response = await this.licenceApiClient.getConditions(version)
    return this.parseResponse(response)
  }

  async getActiveConditions(): Promise<LicencePolicy> {
    const response = await this.licenceApiClient
      .getActiveConditions()
      .then((res: LicencePolicy) => this.parseResponse(res))
    return response
  }

  /* eslint-disable no-param-reassign */
  parseResponse = (response: LicencePolicy): LicencePolicy => {
    const responseObj = response
    responseObj.additionalConditions.AP.forEach((condition: AdditionalConditionAp) => {
      switch (condition.type) {
        case null:
          delete condition.type
          break
        case 'RegionOfResidence':
          condition.type = RegionOfResidence
          break
        case 'RestrictionOfResidency':
          condition.type = RestrictionOfResidency
          break
        case 'MedicalAppointmentType':
          condition.type = MedicalAppointmentType
          break
        case 'AppointmentTimeAndPlace':
          condition.type = AppointmentTimeAndPlace
          break
        case 'NoContactWithVictim':
          condition.type = NoContactWithVictim
          break
        case 'UnsupervisedContact':
          condition.type = UnsupervisedContact
          break
        case 'NamedIndividuals':
          condition.type = NamedIndividuals
          break
        case 'NamedOrganisation':
          condition.type = NamedOrganisation
          break
        case 'BehaviourProblems':
          condition.type = BehaviourProblems
          break
        case 'WorkingWithChildren':
          condition.type = WorkingWithChildren
          break
        case 'SpecifiedItem':
          condition.type = SpecifiedItem
          break
        case 'IntimateRelationshipWithGender':
          condition.type = IntimateRelationshipWithGender
          break
        case 'CurfewTerms':
          condition.type = CurfewTerms
          break
        case 'CurfewAddress':
          condition.type = CurfewAddress
          break
        case 'OutOfBoundsRegion':
          condition.type = OutOfBoundsRegion
          break
        case 'OutOfBoundsPremises':
          condition.type = OutOfBoundsPremises
          break
        case 'OutOfBoundsPremisesType':
          condition.type = OutOfBoundsPremisesType
          break
        case 'ReportToApprovedPremises':
          condition.type = ReportToApprovedPremises
          break
        case 'ReportToPoliceStation':
          condition.type = ReportToPoliceStation
          break
        case 'DrugTestLocation':
          condition.type = DrugTestLocation
          break
        case 'ElectronicMonitoringTypes':
          condition.type = ElectronicMonitoringTypes
          break
        case 'ElectronicMonitoringPeriod':
          condition.type = ElectronicMonitoringPeriod
          break
        case 'ApprovedAddress':
          condition.type = ApprovedAddress
          break
        case 'AlcoholMonitoringPeriod':
          condition.type = AlcoholMonitoringPeriod
          break
        case 'ElectronicTagPeriod':
          condition.type = ElectronicTagPeriod
      }
    })
    responseObj.additionalConditions.PSS.forEach((condition: AdditionalConditionPss) => {
      switch (condition.type) {
        case null:
          delete condition.type
          break
        case 'AppointmentTimeAndPlaceDuringPss':
          condition.type = AppointmentTimeAndPlaceDuringPss
          break
        case 'DrugTestLocation':
          condition.type = DrugTestLocation
          break
      }
    })
    return responseObj
  }
  /* eslint-disable no-param-reassign */
}
