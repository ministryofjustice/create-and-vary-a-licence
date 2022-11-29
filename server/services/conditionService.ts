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
import AlcoholRestrictionPeriod from '../routes/creatingLicences/types/additionalConditionInputs/alcoholRestrictionPeriod'
import CurfewTerms from '../routes/creatingLicences/types/additionalConditionInputs/curfewTerms'
import CurfewAddress from '../routes/creatingLicences/types/additionalConditionInputs/curfewAddress'
import NoContactWithVictim from '../routes/creatingLicences/types/additionalConditionInputs/noContactWithVictim'
import ReportToApprovedPremises from '../routes/creatingLicences/types/additionalConditionInputs/reportToApprovedPremises'
// eslint-disable-next-line camelcase
import ReportToApprovedPremisesPolicyV2_0 from '../routes/creatingLicences/types/additionalConditionInputs/reportToApprovedPremisesPolicyV2_0'
import SpecifiedItem from '../routes/creatingLicences/types/additionalConditionInputs/specifiedItem'
import NamedIndividuals from '../routes/creatingLicences/types/additionalConditionInputs/namedIndividuals'
import NamedOrganisation from '../routes/creatingLicences/types/additionalConditionInputs/namedOrganisation'
import ReportToPoliceStation from '../routes/creatingLicences/types/additionalConditionInputs/reportToPoliceStation'
// eslint-disable-next-line camelcase
import ReportToPoliceStationPolicyV2_0 from '../routes/creatingLicences/types/additionalConditionInputs/reportToPoliceStationPolicyV2_0'
import AppointmentTimeAndPlaceDuringPss from '../routes/creatingLicences/types/additionalConditionInputs/appointmentTimeAndPlaceDuringPss'
import LicenceType from '../enumeration/licenceType'
import {
  AdditionalCondition,
  AdditionalConditionAp,
  AdditionalConditionData,
  AdditionalConditionPss,
  LicencePolicy,
  StandardCondition,
} from '../@types/licenceApiClientTypes'

import ElectronicTagPeriod from '../routes/creatingLicences/types/additionalConditionInputs/electronicTagPeriod'
import ConditionFormatter from './conditionFormatter'

export default class ConditionService {
  constructor(
    private readonly licenceApiClient: LicenceApiClient,
    private readonly conditionFormatter = new ConditionFormatter()
  ) {}

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
    return this.conditionFormatter.format(configCondition, enteredData)
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
        case 'ReportToApprovedPremisesPolicyV2_0':
          // eslint-disable-next-line camelcase
          condition.type = ReportToApprovedPremisesPolicyV2_0
          break
        case 'ReportToPoliceStation':
          condition.type = ReportToPoliceStation
          break
        case 'ReportToPoliceStationPolicyV2_0':
          // eslint-disable-next-line camelcase
          condition.type = ReportToPoliceStationPolicyV2_0
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
        case 'AlcoholRestrictionPeriod':
          condition.type = AlcoholRestrictionPeriod
          break
        case 'ElectronicTagPeriod':
          condition.type = ElectronicTagPeriod
          break
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
