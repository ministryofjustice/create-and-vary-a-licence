import * as types from './licenceApiImport'

export type AdditionalCondition = types.AdditionalCondition
export type AddHdcCurfewAddressRequest = types.AddHdcCurfewAddressRequest
export type AppointmentPersonRequest = types.AppointmentPersonRequest
export type AppointmentPersonUpdateResponse = types.AppointmentPersonUpdateResponse
export type AppointmentTimeRequest = types.AppointmentTimeRequest
export type AuditEvent = types.AuditEvent
export type AuditRequest = types.AuditRequest
export type BespokeCondition = types.BespokeCondition
export type BespokeConditionsRequest = types.BespokeConditionRequest
export type AdditionalConditionsRequest = types.AdditionalConditionsRequest
export type UpdateAdditionalConditionDataRequest = types.UpdateAdditionalConditionDataRequest
export type AdditionalConditionData = types.AdditionalConditionData
export type ContactNumberRequest = types.ContactNumberRequest
export type CreateLicenceResponse = types.CreateLicenceResponse
export type CreateVariationResponse = types.CreateVariationResponse
export type EditLicenceResponse = types.EditLicenceResponse
export type LicenceSummary = types.LicenceSummary
export type Licence =
  | types.HdcVariationLicence
  | types.VariationLicence
  | types.HardStopLicence
  | types.CrdLicence
  | HdcLicence
  | types.PrrdLicenceResponse
  | types.TimeServedLicence

export type VariationLicence = types.VariationLicence
export type HdcLicence = types.HdcLicence
export type HdcVariationLicence = types.HdcVariationLicence
export type LicenceEvent = types.LicenceEvent
export type StatusUpdateRequest = types.StatusUpdateRequest
export type UpdateComRequest = types.UpdateComRequest
export type UpdatePrisonUserRequest = types.UpdatePrisonUserRequest
export type AddAdditionalConditionRequest = types.AddAdditionalConditionRequest
export type UpdateSpoDiscussionRequest = types.UpdateSpoDiscussionRequest
export type UpdateVloDiscussionRequest = types.UpdateVloDiscussionRequest
export type UpdateReasonForVariationRequest = types.UpdateReasonForVariationRequest
export type ReferVariationRequest = types.ReferVariationRequest
export type NotifyRequest = types.NotifyRequest
export type OmuContact = types.OmuContact
export type LicencePolicyResponse = types.LicencePolicy
export type StandardCondition = types.StandardCondition
export type AdditionalConditionsResponse = types.AdditionalConditions
export type AdditionalConditionApResponse = types.AdditionalConditionAp
export type AdditionalConditionPssResponse = types.AdditionalConditionPss
export type LicenceConditionChange = types.LicenceConditionChanges
export type OverrideLicenceDatesRequest = types.OverrideLicenceDatesRequest
export type OverrideLicencePrisonerDetailsRequest = types.OverrideLicencePrisonerDetailsRequest
export type ProbationSearchRequest = types.ProbationUserSearchRequest
export type ComSearchResponse = types.ComSearchResponse
export type FoundComCase = types.FoundComCase
export type ComReviewCount = types.ComReviewCount
export type CvlPrisoner = types.Prisoner
export type CvlFields = types.CvlFields
export type PrisonerWithCvlFields = types.PrisonerWithCvlFields
export type ApprovalCase = types.ApprovalCase
export type CaCaseloadSearch = types.CaCaseloadSearch
export type CaCase = types.CaCase
export type ComCreateCase = types.ComCreateCase
export type ComVaryCase = types.ComVaryCase
export type TeamCaseloadRequest = types.TeamCaseloadRequest
export type VaryApproverCaseloadSearchRequest = types.VaryApproverCaseloadSearchRequest
export type VaryApproverCaseloadSearchResponse = types.VaryApproverCaseloadSearchResponse
export type VaryApproverCase = types.VaryApproverCase
export type ElectronicMonitoringProvider = types.ElectronicMonitoringProvider
export type PrisonUserSearchRequest = types.PrisonUserSearchRequest
export type PrisonCaseAdminSearchResult = types.PrisonCaseAdminSearchResult
export type LastMinuteHandoverCaseResponse = types.LastMinuteHandoverCaseResponse
export type UpcomingReleasesWithMonitoringConditionsResponse = types.UpcomingReleasesWithMonitoringConditionsResponse

export type ApproverSearchRequest = types.ApproverSearchRequest
export type ApproverSearchResponse = types.ApproverSearchResponse
export type UpdateElectronicMonitoringProgrammeRequest = types.UpdateElectronicMonitoringProgrammeRequest
export type AddressSearchResponse = types.AddressSearchResponse
export type AddAddressRequest = types.AddAddressRequest
export type AddressResponse = types.AddressResponse
export type LicencePermissionsRequest = types.LicencePermissionsRequest
export type LicencePermissionsResponse = types.LicencePermissionsResponse
export type EligibilityAssessment = types.EligibilityAssessment
export type ExternalTimeServedRecordRequest = types.ExternalTimeServedRecordRequest
export type ExternalTimeServedRecordResponse = types.ExternalTimeServedRecordResponse
export type TimeServedProbationConfirmContactRequest = types.TimeServedProbationConfirmContactRequest
export type TimeServedLicence = types.TimeServedLicence
export type CheckCaseAccessRequest = types.CheckCaseAccessRequest
export type CaseAccessDetails = types.CaseAccessDetails
export type WeeklyCurfewTimesRequest = types.UpdateWeeklyCurfewTimesRequest
export type CurfewTimes = types.CurfewTimes
export type ProbationCase = types.ProbationCase
export type FirstNightCurfewTimesRequest = types.UpdateFirstNightCurfewTimesRequest
export type LicenceStatusResponse = types.LicenceStatusResponse
export type RecallSupportInfo = types.RecallSupportInfo
export type RemandSupportInfo = types.RemandSupportInfo
export type Is91SupportInfo = types.Is91SupportInfo
export type HdcSupportInfo = types.HdcSupportInfo
export type SupportInfo = types.SupportInfo
export type PolicyUpdateResponse = types.PolicyUpdateResponse
export type HdcCurfewAddress = types.HdcCurfewAddress

export type EditVariationRequest = {
  username: string
}
