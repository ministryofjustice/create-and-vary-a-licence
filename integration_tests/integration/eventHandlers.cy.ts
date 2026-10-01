context('Event handlers', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('purgeQueues')
    cy.task('stubSystemToken')
  })

  describe('Domain events', () => {
    it('should listen to the released event and call endpoint to update licence status to ACTIVE', () => {
      cy.task('searchPrisonersByBookingIds')
      cy.task('stubGetLicencesForOffender', { nomisId: 'A7774DY', status: 'APPROVED', bookingId: 12345 })
      cy.task('stubGetHdcLicencesForOffender', { status: 'APPROVED', bookingId: 12345 })
      cy.task('stubUpdateLicenceStatus')

      cy.task(
        'sendDomainEvent',
        `{
            "Message": "{\\"additionalInformation\\":{\\"nomsNumber\\":\\"A7774DY\\",\\"reason\\":\\"RELEASED\\",\\"details\\":\\"Movement reason code CR\\",\\"currentLocation\\":\\"OUTSIDE_PRISON\\",\\"prisonId\\":\\"MDI\\",\\"currentPrisonStatus\\":\\"NOT_UNDER_PRISON_CARE\\"},\\"version\\":1,\\"occurredAt\\":\\"2022-01-12T14:56:51.662128Z\\",\\"publishedAt\\":\\"2022-01-12T14:58:25.021008001Z\\",\\"description\\":\\"A prisoner has been released from prison\\"}",
            "MessageAttributes": {
              "eventType": {
                "Type": "String",
                "Value": "prisoner-offender-search.prisoner.released"
              }
            }
         }`,
      )

      cy.task('verifyEndpointCalledWith', {
        verb: 'PUT',
        path: '/licences-api/licence/id/1/status',
        times: 1,
        param: 'status',
        value: 'ACTIVE',
      })
    })

    it('should listen to the released event and call endpoint to update licence status to INACTIVE if the CRD licence is approved for HDC', () => {
      cy.task('searchPrisonersByBookingIds', '2022-01-12')
      cy.task('stubGetLicencesForOffender', { nomisId: 'A7774DY', status: 'APPROVED', bookingId: 12345 })
      cy.task('stubGetHdcLicencesForOffender', { status: 'APPROVED', bookingId: 12345 })
      cy.task('stubUpdateLicenceStatus')

      cy.task(
        'sendDomainEvent',
        `{
            "Message": "{\\"additionalInformation\\":{\\"nomsNumber\\":\\"A7774DY\\",\\"reason\\":\\"RELEASED\\",\\"details\\":\\"Movement reason code CR\\",\\"currentLocation\\":\\"OUTSIDE_PRISON\\",\\"prisonId\\":\\"MDI\\",\\"currentPrisonStatus\\":\\"NOT_UNDER_PRISON_CARE\\"},\\"version\\":1,\\"occurredAt\\":\\"2022-01-12T14:56:51.662128Z\\",\\"publishedAt\\":\\"2022-01-12T14:58:25.021008001Z\\",\\"description\\":\\"A prisoner has been released from prison\\"}",
            "MessageAttributes": {
              "eventType": {
                "Type": "String",
                "Value": "prisoner-offender-search.prisoner.released"
              }
            }
         }`,
      )

      cy.task('verifyEndpointCalledWith', {
        verb: 'PUT',
        path: '/licences-api/licence/id/1/status',
        times: 1,
        param: 'status',
        value: 'INACTIVE',
      })
    })

    it('should listen to the released event and call endpoint to update HDC licence status to ACTIVE regardless of HDC status', () => {
      cy.task('searchPrisonersByBookingIds', '2022-01-12')
      cy.task('stubGetLicencesForOffender', { nomisId: 'A7774DY', status: 'APPROVED', bookingId: 12345, kind: 'HDC' })
      cy.task('stubGetHdcLicencesForOffender', { status: 'APPROVED', bookingId: 12345 })
      cy.task('stubUpdateLicenceStatus')

      cy.task(
        'sendDomainEvent',
        `{
            "Message": "{\\"additionalInformation\\":{\\"nomsNumber\\":\\"A7774DY\\",\\"reason\\":\\"RELEASED\\",\\"details\\":\\"Movement reason code CR\\",\\"currentLocation\\":\\"OUTSIDE_PRISON\\",\\"prisonId\\":\\"MDI\\",\\"currentPrisonStatus\\":\\"NOT_UNDER_PRISON_CARE\\"},\\"version\\":1,\\"occurredAt\\":\\"2022-01-12T14:56:51.662128Z\\",\\"publishedAt\\":\\"2022-01-12T14:58:25.021008001Z\\",\\"description\\":\\"A prisoner has been released from prison\\"}",
            "MessageAttributes": {
              "eventType": {
                "Type": "String",
                "Value": "prisoner-offender-search.prisoner.released"
              }
            }
         }`,
      )

      cy.task('verifyEndpointCalledWith', {
        verb: 'PUT',
        path: '/licences-api/licence/id/1/status',
        times: 1,
        param: 'status',
        value: 'ACTIVE',
      })
    })
  })
})
