export type DomainEvent = {
  eventType: string
  additionalInformation: {
    nomsNumber: string
    reason: string
  }
}
export type ProbationEvent = {
  eventType: string
  crn: string
}
