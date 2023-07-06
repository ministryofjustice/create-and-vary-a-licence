export type DomainEventMessage = {
  additionalInformation: {
    categoriesChanged?: string[]
    nomsNumber: string
    reason: string
    prisonId: string
  }
}
export type ProbationEventMessage = {
  crn: string
}

export type PrisonEventMessage = {
  addressEndDate?: string
  addressId?: number
  addressUsage?: string
  agencyIncidentId?: number
  agencyLocationId?: string
  alertCode?: string
  alertDateTime?: string
  alertSeq?: number
  alertType?: string
  aliasOffenderId?: number
  assessmentSeq?: number
  bedAssignmentSeq?: number
  bookingId?: number
  bookingNumber?: string
  caseNoteId?: number
  chargeSeq?: number
  conditionCode?: string
  directionCode?: string
  escortCode?: string
  eventDatetime?: string
  eventId?: string
  eventType?: string
  expiryDateTime?: string
  findingCode?: string
  fromAgencyLocationId?: string
  identifierType?: string
  identifierValue?: string
  imprisonmentStatusSeq?: number
  incidentCaseId?: number
  incidentPartySeq?: number
  incidentQuestionSeq?: number
  incidentRequirementSeq?: number
  incidentResponseSeq?: number
  livingUnitId?: number
  mailAddressFlag?: string
  movementDateTime?: string
  movementReasonCode?: string
  movementSeq?: number
  movementType?: string
  nomisEventType?: string
  offenderId?: number
  offenderIdDisplay?: string
  offenderSentenceConditionId?: number
  oicHearingId?: number
  oicOffenceId?: number
  ownerClass?: string
  ownerId?: number
  personId?: number
  pleaFindingCode?: string
  previousBookingNumber?: string
  previousOffenderId?: number
  primaryAddressFlag?: string
  resultSeq?: number
  riskPredictorId?: number
  rootOffenderId?: number
  sanctionSeq?: number
  sentenceCalculationId?: number
  sentenceSeq?: number
  toAgencyLocationId?: string
}
