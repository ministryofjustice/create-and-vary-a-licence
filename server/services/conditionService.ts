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
  AdditionalConditionsResponse,
  Licence,
  LicencePolicyResponse,
  StandardCondition,
} from '../@types/licenceApiClientTypes'

import ElectronicTagPeriod from '../routes/creatingLicences/types/additionalConditionInputs/electronicTagPeriod'
import { AdditionalConditionAp, AdditionalConditionPss, AdditionalConditionsConfig } from '../@types/LicencePolicy'
import { User } from '../@types/CvlUserDetails'
import LicenceStatus from '../enumeration/licenceStatus'

type PolicyAdditionalCondition = AdditionalConditionAp | AdditionalConditionPss

export default class ConditionService {
  constructor(private readonly licenceApiClient: LicenceApiClient) {}

  private async getLicencePolicy(version: string = null): Promise<LicencePolicyResponse> {
    let licencePolicy
    if (version) {
      licencePolicy = await this.licenceApiClient.getLicencePolicyForVersion(version)
    } else {
      licencePolicy = await this.licenceApiClient.getActiveLicencePolicy()
    }

    return licencePolicy
  }

  async getPolicyVersion(): Promise<string> {
    return (await this.getLicencePolicy()).version
  }

  async getStandardConditions(licenceType: string, version: string = null): Promise<StandardCondition[]> {
    const conditions = await this.getLicencePolicy(version)
    return conditions.standardConditions[licenceType].map((condition: StandardCondition, index: number) => {
      return {
        ...condition,
        sequence: index,
      }
    })
  }

  async getAdditionalConditions(version: string): Promise<AdditionalConditionsConfig> {
    const policy = await this.getLicencePolicy(version)
    return this.parseResponse(policy.additionalConditions)
  }

  async getAdditionalConditionByCode(searchCode: string, version: string = null): Promise<PolicyAdditionalCondition> {
    const additionalConditions = await this.getAdditionalConditions(version)
    return Object.values(additionalConditions)
      .flat()
      .find(({ code }) => code === searchCode)
  }

  async getGroupedAdditionalConditions(
    licenceType: string,
    version: string = null
  ): Promise<{ category: string; conditions: PolicyAdditionalCondition[] }[]> {
    const additionalConditions = await this.getAdditionalConditions(version)
    const map = new Map<string, PolicyAdditionalCondition[]>()
    additionalConditions[licenceType].forEach((condition: PolicyAdditionalCondition) => {
      const collection = map.get(condition.category)
      if (!collection) {
        map.set(condition.category, [condition])
      } else {
        collection.push(condition)
      }
    })
    return Array.from(map, ([category, conditions]) => ({ category, conditions }))
  }

  async getAdditionalConditionType(searchCode: string, version: string = null): Promise<LicenceType> {
    const additionalConditions = await this.getAdditionalConditions(version)
    if (
      Object.values(additionalConditions.AP)
        .flat()
        .find(({ code }) => code === searchCode)
    ) {
      return LicenceType.AP
    }
    if (
      Object.values(additionalConditions.PSS)
        .flat()
        .find(({ code }) => code === searchCode)
    ) {
      return LicenceType.PSS
    }

    return null
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

  /* eslint-disable no-param-reassign */
  parseResponse = (additionalConditionsResponse: AdditionalConditionsResponse): AdditionalConditionsConfig => {
    const mappedConditions: AdditionalConditionsConfig = { AP: [], PSS: [] }
    mappedConditions.AP = additionalConditionsResponse.AP.map(condition => {
      let validator
      switch (condition.type) {
        case null:
          delete condition.type
          break
        case 'RegionOfResidence':
          validator = RegionOfResidence
          break
        case 'RestrictionOfResidency':
          validator = RestrictionOfResidency
          break
        case 'MedicalAppointmentType':
          validator = MedicalAppointmentType
          break
        case 'AppointmentTimeAndPlace':
          validator = AppointmentTimeAndPlace
          break
        case 'NoContactWithVictim':
          validator = NoContactWithVictim
          break
        case 'UnsupervisedContact':
          validator = UnsupervisedContact
          break
        case 'NamedIndividuals':
          validator = NamedIndividuals
          break
        case 'NamedOrganisation':
          validator = NamedOrganisation
          break
        case 'BehaviourProblems':
          validator = BehaviourProblems
          break
        case 'WorkingWithChildren':
          validator = WorkingWithChildren
          break
        case 'SpecifiedItem':
          validator = SpecifiedItem
          break
        case 'IntimateRelationshipWithGender':
          validator = IntimateRelationshipWithGender
          break
        case 'CurfewTerms':
          validator = CurfewTerms
          break
        case 'CurfewAddress':
          validator = CurfewAddress
          break
        case 'OutOfBoundsRegion':
          validator = OutOfBoundsRegion
          break
        case 'OutOfBoundsPremises':
          validator = OutOfBoundsPremises
          break
        case 'OutOfBoundsPremisesType':
          validator = OutOfBoundsPremisesType
          break
        case 'ReportToApprovedPremises':
          validator = ReportToApprovedPremises
          break
        case 'ReportToApprovedPremisesPolicyV2_0':
          // eslint-disable-next-line camelcase
          validator = ReportToApprovedPremisesPolicyV2_0
          break
        case 'ReportToPoliceStation':
          validator = ReportToPoliceStation
          break
        case 'ReportToPoliceStationPolicyV2_0':
          // eslint-disable-next-line camelcase
          validator = ReportToPoliceStationPolicyV2_0
          break
        case 'DrugTestLocation':
          validator = DrugTestLocation
          break
        case 'ElectronicMonitoringTypes':
          validator = ElectronicMonitoringTypes
          break
        case 'ElectronicMonitoringPeriod':
          validator = ElectronicMonitoringPeriod
          break
        case 'ApprovedAddress':
          validator = ApprovedAddress
          break
        case 'AlcoholMonitoringPeriod':
          validator = AlcoholMonitoringPeriod
          break
        case 'AlcoholRestrictionPeriod':
          validator = AlcoholRestrictionPeriod
          break
        case 'ElectronicTagPeriod':
          validator = ElectronicTagPeriod
          break
      }
      return { ...condition, validatorType: validator }
    })
    mappedConditions.PSS = additionalConditionsResponse.PSS.map(condition => {
      let validator
      switch (condition.type) {
        case null:
          delete condition.type
          break
        case 'AppointmentTimeAndPlaceDuringPss':
          validator = AppointmentTimeAndPlaceDuringPss
          break
        case 'DrugTestLocation':
          validator = DrugTestLocation
          break
      }
      return { ...condition, validatorType: validator }
    })
    return mappedConditions
  }
  /* eslint-disable no-param-reassign */

  async getAdditionalAPConditionsForSummaryAndPdf(licence: Licence, user: User): Promise<AdditionalCondition[]> {
    const isInVariation = [
      LicenceStatus.VARIATION_IN_PROGRESS,
      LicenceStatus.VARIATION_SUBMITTED,
      LicenceStatus.VARIATION_REJECTED,
      LicenceStatus.VARIATION_APPROVED,
    ].includes(<LicenceStatus>licence.statusCode)

    if (licence.isInPssPeriod && isInVariation) {
      return (await this.licenceApiClient.getParentLicenceOrSelf(licence.id.toString(), user))
        ?.additionalLicenceConditions
    }
    return licence.additionalLicenceConditions
  }
}
