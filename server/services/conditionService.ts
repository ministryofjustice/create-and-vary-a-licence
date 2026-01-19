import LicenceApiClient from '../data/licenceApiClient'
import RegionOfResidence from '../routes/manageConditions/types/additionalConditionInputs/regionOfResidence'
import RestrictionOfResidency from '../routes/manageConditions/types/additionalConditionInputs/restrictionOfResidency'
import MedicalAppointmentType from '../routes/manageConditions/types/additionalConditionInputs/medicalAppointmentType'
import UnsupervisedContact from '../routes/manageConditions/types/additionalConditionInputs/unsupervisedContact'
import WorkingWithChildren from '../routes/manageConditions/types/additionalConditionInputs/workingWithChildren'
import IntimateRelationshipWithGender from '../routes/manageConditions/types/additionalConditionInputs/intimateRelationshipWithGender'
import BehaviourProblems from '../routes/manageConditions/types/additionalConditionInputs/behaviourProblems'
import AppointmentTimeAndPlace from '../routes/manageConditions/types/additionalConditionInputs/appointmentTimeAndPlace'
import OutOfBoundsRegion from '../routes/manageConditions/types/additionalConditionInputs/outOfBoundsRegion'
import OutOfBoundsPremises from '../routes/manageConditions/types/additionalConditionInputs/outOfBoundsPremises'
import OutOfBoundsPremisesType from '../routes/manageConditions/types/additionalConditionInputs/outOfBoundsPremisesType'
import DrugTestLocation from '../routes/manageConditions/types/additionalConditionInputs/drugTestLocation'
import ElectronicMonitoringTypes from '../routes/manageConditions/types/additionalConditionInputs/electronicMonitoringTypes'
import ElectronicMonitoringPeriod from '../routes/manageConditions/types/additionalConditionInputs/electronicMonitoringPeriod'
import ApprovedAddress from '../routes/manageConditions/types/additionalConditionInputs/approvedAddress'
import AlcoholMonitoringPeriod from '../routes/manageConditions/types/additionalConditionInputs/alcoholMonitoringPeriod'
import AlcoholRestrictionPeriod from '../routes/manageConditions/types/additionalConditionInputs/alcoholRestrictionPeriod'
import CurfewTerms from '../routes/manageConditions/types/additionalConditionInputs/curfewTerms'
import CurfewAddress from '../routes/manageConditions/types/additionalConditionInputs/curfewAddress'
import NoContactWithVictim from '../routes/manageConditions/types/additionalConditionInputs/noContactWithVictim'
import ReportToApprovedPremises from '../routes/manageConditions/types/additionalConditionInputs/reportToApprovedPremises'
// eslint-disable-next-line camelcase
import ReportToApprovedPremisesPolicyV2_0 from '../routes/manageConditions/types/additionalConditionInputs/reportToApprovedPremisesPolicyV2_0'
import SpecifiedItem from '../routes/manageConditions/types/additionalConditionInputs/specifiedItem'
import NamedIndividuals from '../routes/manageConditions/types/additionalConditionInputs/namedIndividuals'
import NamedOrganisation from '../routes/manageConditions/types/additionalConditionInputs/namedOrganisation'
import ReportToPoliceStation from '../routes/manageConditions/types/additionalConditionInputs/reportToPoliceStation'
// eslint-disable-next-line camelcase
import ReportToPoliceStationPolicyV2_0 from '../routes/manageConditions/types/additionalConditionInputs/reportToPoliceStationPolicyV2_0'
import AppointmentTimeAndPlaceDuringPss from '../routes/manageConditions/types/additionalConditionInputs/appointmentTimeAndPlaceDuringPss'
import LicenceType from '../enumeration/licenceType'
import {
  AdditionalCondition,
  AdditionalConditionsResponse,
  BespokeCondition,
  Licence,
  LicencePolicyResponse,
  StandardCondition,
} from '../@types/licenceApiClientTypes'

import ElectronicTagPeriod from '../routes/manageConditions/types/additionalConditionInputs/electronicTagPeriod'
import { AdditionalConditionAp, AdditionalConditionPss, AdditionalConditionsConfig } from '../@types/LicencePolicy'
import { User } from '../@types/CvlUserDetails'
import LicenceStatus from '../enumeration/licenceStatus'
import RegisterForServices from '../routes/manageConditions/types/additionalConditionInputs/registerForServices'
import UsageHistory from '../routes/manageConditions/types/additionalConditionInputs/usageHistory'
import TypesOfWebsites from '../routes/manageConditions/types/additionalConditionInputs/typesOfWebsites'
import WebsiteAccess from '../routes/manageConditions/types/additionalConditionInputs/websiteAccess'
import SubstanceMisuse from '../routes/manageConditions/types/additionalConditionInputs/substanceMisuse'
import CashInPossession from '../routes/manageConditions/types/additionalConditionInputs/cashInPossession'
import ValueOfAssets from '../routes/manageConditions/types/additionalConditionInputs/valueOfAssets'
import BankAccountDetails from '../routes/manageConditions/types/additionalConditionInputs/bankAccountDetails'
import DigitalServices from '../routes/manageConditions/types/additionalConditionInputs/digitalServices'
import EvidenceOfIncome from '../routes/manageConditions/types/additionalConditionInputs/evidenceOfIncome'
import OutOfBoundsEvent from '../routes/manageConditions/types/additionalConditionInputs/outOfBoundsEvent'
import OutOfBoundsRegionPolicyV3 from '../routes/manageConditions/types/additionalConditionInputs/outOfBoundsRegionPolicyV3'
import ReportToApprovedPremisesPolicyV3 from '../routes/manageConditions/types/additionalConditionInputs/reportToApprovedPremisesPolicyV3'
import RestrictionOfResidencyPolicyV3 from '../routes/manageConditions/types/additionalConditionInputs/restrictionOfResidencyPolicyV3'
import UnsupervisedContactPolicyV3 from '../routes/manageConditions/types/additionalConditionInputs/unsupervisedContactPolicyV3'
import WorkingWithChildrenPolicyV3 from '../routes/manageConditions/types/additionalConditionInputs/workingWithChildrenPolicyV3'
import InBoundsRegion from '../routes/manageConditions/types/additionalConditionInputs/inBoundsRegion'

export type PolicyAdditionalCondition = AdditionalConditionAp | AdditionalConditionPss

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

  async getStandardConditions(
    licenceType: LicenceType.AP | LicenceType.PSS,
    version: string = null,
  ): Promise<StandardCondition[]> {
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
    licenceType: LicenceType.AP | LicenceType.PSS,
    version: string = null,
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
        case 'RegisterForServices':
          validator = RegisterForServices
          break
        case 'UsageHistory':
          validator = UsageHistory
          break
        case 'TypesOfWebsites':
          validator = TypesOfWebsites
          break
        case 'WebsiteAccess':
          validator = WebsiteAccess
          break
        case 'SubstanceMisuse':
          validator = SubstanceMisuse
          break
        case 'CashInPossession':
          validator = CashInPossession
          break
        case 'ValueOfAssets':
          validator = ValueOfAssets
          break
        case 'BankAccountDetails':
          validator = BankAccountDetails
          break
        case 'EvidenceOfIncome':
          validator = EvidenceOfIncome
          break
        case 'DigitalServices':
          validator = DigitalServices
          break
        case 'OutOfBoundsEvent':
          validator = OutOfBoundsEvent
          break
        case 'OutOfBoundsRegionPolicyV3':
          validator = OutOfBoundsRegionPolicyV3
          break
        case 'ReportToApprovedPremisesPolicyV3':
          validator = ReportToApprovedPremisesPolicyV3
          break
        case 'RestrictionOfResidencyPolicyV3':
          validator = RestrictionOfResidencyPolicyV3
          break
        case 'UnsupervisedContactPolicyV3':
          validator = UnsupervisedContactPolicyV3
          break
        case 'WorkingWithChildrenPolicyV3':
          validator = WorkingWithChildrenPolicyV3
          break
        case 'InBoundsRegion':
          validator = InBoundsRegion
          break
        default: {
          // silently ignore
        }
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
        default: {
          // silently ignore
        }
      }
      return { ...condition, validatorType: validator }
    })
    return mappedConditions
  }

  async getAdditionalAPConditionsForSummaryAndPdf(licence: Licence, user: User): Promise<AdditionalCondition[]> {
    const conditionDataToExcludeFromSummary = ['nameTypeAndOrAddress']

    let additionalConditions: AdditionalCondition[]
    if (licence.isInPssPeriod && this.isInVariation(licence)) {
      additionalConditions = (await this.licenceApiClient.getParentLicenceOrSelf(licence.id, user))
        ?.additionalLicenceConditions
    } else {
      additionalConditions = licence.additionalLicenceConditions
    }

    const conditionDataToDisplay: AdditionalCondition[] = []
    additionalConditions.forEach(condition => {
      const displayData = condition.data
        ? condition.data.filter(data => !conditionDataToExcludeFromSummary.includes(data.field))
        : condition.data
      conditionDataToDisplay.push({
        ...condition,
        data: displayData,
      })
    })

    return conditionDataToDisplay
  }

  async getbespokeConditionsForSummaryAndPdf(licence: Licence, user: User): Promise<BespokeCondition[]> {
    if (licence.isInPssPeriod && this.isInVariation(licence)) {
      return (await this.licenceApiClient.getParentLicenceOrSelf(licence.id, user))?.bespokeConditions
    }
    return licence.bespokeConditions
  }

  isInVariation(licence: Licence): boolean {
    return [
      LicenceStatus.VARIATION_IN_PROGRESS,
      LicenceStatus.VARIATION_SUBMITTED,
      LicenceStatus.VARIATION_REJECTED,
      LicenceStatus.VARIATION_APPROVED,
    ].includes(<LicenceStatus>licence.statusCode)
  }
}
