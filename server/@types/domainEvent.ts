export type DomainEvent = {
  eventType: string
  additionalInformation: {
    nomsNumber: string
    reason: string
  }
}
