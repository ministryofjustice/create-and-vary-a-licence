import { ClassConstructor } from 'class-transformer'
import {
  AdditionalConditionApResponse,
  AdditionalConditionPssResponse,
  AdditionalConditionsResponse,
  LicencePolicyResponse,
} from './licenceApiClientTypes'

// Used to convert 'type' values from strings to Objects containing validation information
// Conversion handled in the ConditionService

export type LicencePolicy = Omit<LicencePolicyResponse, 'additionalConditions'> & {
  additionalConditions: AdditionalConditionsConfig
}

export type AdditionalConditionsConfig = Omit<AdditionalConditionsResponse, 'AP' | 'PSS'> & {
  AP: AdditionalConditionAp[]
  PSS: AdditionalConditionPss[]
}

export type AdditionalConditionAp = AdditionalConditionApResponse & {
  validatorType?: ClassConstructor<object>
}

export type AdditionalConditionPss = AdditionalConditionPssResponse & {
  validatorType?: ClassConstructor<object>
}
