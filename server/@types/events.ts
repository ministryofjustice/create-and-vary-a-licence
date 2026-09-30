export type DomainEventMessage = {
  additionalInformation: {
    categoriesChanged?: string[]
    nomsNumber: string
    reason: string
    prisonId: string
  }
}
