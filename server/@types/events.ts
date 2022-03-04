export type DomainEventMessage = {
  additionalInformation: {
    nomsNumber: string
    reason: string
    prisonId: string
  }
}
export type ProbationEventMessage = {
  crn: string
}
