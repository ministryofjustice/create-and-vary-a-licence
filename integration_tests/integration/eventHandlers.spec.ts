context('Event handlers', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('purgeQueues')
    cy.task('stubSystemToken')
  })

  describe('Domain events', () => {
    it('should listen to the released event and call endpoint to update licence status to ACTIVE', () => {
      cy.task('stubGetLicencesForOffender', { nomisId: 'A7774DY', status: 'APPROVED' })
      cy.task('stubUpdateLicenceStatus')

      cy.task(
        'sendDomainEvent',
        `{
            "Message" :  "{\\"eventType\\":\\"prison-offender-events.prisoner.released\\",\\"additionalInformation\\":{\\"nomsNumber\\":\\"A7774DY\\",\\"reason\\":\\"RELEASED\\",\\"details\\":\\"Movement reason code CR\\",\\"currentLocation\\":\\"OUTSIDE_PRISON\\",\\"prisonId\\":\\"MDI\\",\\"currentPrisonStatus\\":\\"NOT_UNDER_PRISON_CARE\\"},\\"version\\":1,\\"occurredAt\\":\\"2022-01-12T14:56:51.662128Z\\",\\"publishedAt\\":\\"2022-01-12T14:58:25.021008001Z\\",\\"description\\":\\"A prisoner has been released from prison\\"}"
         }`
      )

      cy.task('verifyEndpointCalled', { verb: 'PUT', path: '/licence/id/1/status', times: 1 }).then(success => {
        if (!success) throw new Error(`Endpoint called an unexpected number of times`)
      })
    })
  })
})
