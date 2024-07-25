import { components } from './licenceApiImport'

export type AdditionalCondition = components['schemas']['AdditionalCondition']
export type AppointmentAddressRequest = components['schemas']['AppointmentAddressRequest']
export type AppointmentPersonRequest = components['schemas']['AppointmentPersonRequest']
export type AppointmentTimeRequest = components['schemas']['AppointmentTimeRequest']
export type AuditEvent = components['schemas']['AuditEvent']
export type AuditRequest = components['schemas']['AuditRequest']
export type BespokeCondition = components['schemas']['BespokeCondition']
export type BespokeConditionsRequest = components['schemas']['BespokeConditionRequest']
export type AdditionalConditionsRequest = components['schemas']['AdditionalConditionsRequest']
export type UpdateStandardConditionDataRequest = components['schemas']['UpdateStandardConditionDataRequest']
export type UpdateAdditionalConditionDataRequest = components['schemas']['UpdateAdditionalConditionDataRequest']
export type AdditionalConditionData = components['schemas']['AdditionalConditionData']
export type ContactNumberRequest = components['schemas']['ContactNumberRequest']
export type CreateLicenceRequest = components['schemas']['CreateLicenceRequest']
export type LicenceCreationResponse = components['schemas']['LicenceCreationResponse']
export type LicenceSummary = components['schemas']['LicenceSummary']
export type Licence =
  | components['schemas']['VariationLicence']
  | components['schemas']['HardStopLicence']
  | components['schemas']['CrdLicence']
export type LicenceEvent = components['schemas']['LicenceEvent']
export type StatusUpdateRequest = components['schemas']['StatusUpdateRequest']
export type UpdateComRequest = components['schemas']['UpdateComRequest']
export type UpdatePrisonUserRequest = components['schemas']['UpdatePrisonUserRequest']
export type AddAdditionalConditionRequest = components['schemas']['AddAdditionalConditionRequest']
export type UpdateProbationTeamRequest = components['schemas']['UpdateProbationTeamRequest']
export type UpdateSpoDiscussionRequest = components['schemas']['UpdateSpoDiscussionRequest']
export type UpdateVloDiscussionRequest = components['schemas']['UpdateVloDiscussionRequest']
export type UpdateReasonForVariationRequest = components['schemas']['UpdateReasonForVariationRequest']
export type UpdatePrisonInformationRequest = components['schemas']['UpdatePrisonInformationRequest']
export type UpdateSentenceDatesRequest = components['schemas']['UpdateSentenceDatesRequest']
export type ReferVariationRequest = components['schemas']['ReferVariationRequest']
export type EmailContact = components['schemas']['PromptLicenceCreationRequest']
export type NotifyRequest = components['schemas']['NotifyRequest']
export type OmuContact = components['schemas']['OmuContact']
export type LicencePolicyResponse = components['schemas']['LicencePolicy']
export type StandardConditions = components['schemas']['StandardConditions']
export type StandardCondition = components['schemas']['StandardCondition']
export type AdditionalConditionsResponse = components['schemas']['AdditionalConditions']
export type AdditionalConditionApResponse = components['schemas']['AdditionalConditionAp']
export type AdditionalConditionPssResponse = components['schemas']['AdditionalConditionPss']
export type Input = components['schemas']['Input']
export type LicenceConditionChange = components['schemas']['LicenceConditionChanges']
export type OverrideLicenceDatesRequest = components['schemas']['OverrideLicenceDatesRequest']
export type UpdateOffenderDetailsRequest = components['schemas']['UpdateOffenderDetailsRequest']
export type ProbationSearchRequest = components['schemas']['ProbationUserSearchRequest']
export type ProbationSearchResult = components['schemas']['ProbationSearchResult']
export type FoundProbationRecord = components['schemas']['FoundProbationRecord']
export type ComReviewCount = components['schemas']['ComReviewCount']
export type CaseloadItem = components['schemas']['CaseloadItem']
export type SearchResultsPage = components['schemas']['SearchResultsPage']
export type CvlPrisoner = components['schemas']['Prisoner']
export type CvlFields = components['schemas']['CvlFields']
export type ApprovalCase = components['schemas']['ApprovalCase']
export type CaCaseloadSearch = components['schemas']['CaCaseloadSearch']
export type CaCaseLoad = components['schemas']['CaCaseLoad']
export type CaCase = components['schemas']['CaCase']
