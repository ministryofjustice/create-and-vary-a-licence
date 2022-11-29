context('Event handlers', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('purgeQueues')
    cy.task('stubSystemToken')
  })

  describe('Domain events', () => {
    it('should listen to the released event and call endpoint to update licence status to ACTIVE', () => {
      cy.task('stubGetLicencesForOffender', { nomisId: 'A7774DY', status: 'APPROVED', bookingId: 12345 })
      cy.task('stubGetHdcLicencesForOffender', { status: 'REJECTED', bookingId: 12345 })
      cy.task('stubUpdateLicenceStatus')

      cy.task(
        'sendDomainEvent',
        `{
            "Message": "{\\"additionalInformation\\":{\\"nomsNumber\\":\\"A7774DY\\",\\"reason\\":\\"RELEASED\\",\\"details\\":\\"Movement reason code CR\\",\\"currentLocation\\":\\"OUTSIDE_PRISON\\",\\"prisonId\\":\\"MDI\\",\\"currentPrisonStatus\\":\\"NOT_UNDER_PRISON_CARE\\"},\\"version\\":1,\\"occurredAt\\":\\"2022-01-12T14:56:51.662128Z\\",\\"publishedAt\\":\\"2022-01-12T14:58:25.021008001Z\\",\\"description\\":\\"A prisoner has been released from prison\\"}",
            "MessageAttributes": {
              "eventType": {
                "Type": "String",
                "Value": "prison-offender-events.prisoner.released"
              }
            }
         }`
      )

      cy.task('verifyEndpointCalled', { verb: 'PUT', path: '/licence/id/1/status', times: 1 })
    })
  })

  describe('Probation events', () => {
    it('should listen to the offender manager changed event and call endpoint to update responsible COM', () => {
      cy.task('stubGetProbationer')
      cy.task('stubGetAnOffendersManagers')
      cy.task('stubGetStaffDetailsByStaffId')
      cy.task('stubGetUserDetailsByUsername')
      cy.task('stubAssignRole')
      cy.task('stubUpdateResponsibleCom')
      cy.task('stubUpdateProbationTeam')

      cy.task(
        'sendProbationEvent',
        `{
          "Message": "{\\"crn\\":\\"X1234\\"}",
          "MessageAttributes": {
            "eventType": {
              "Type": "String",
              "Value": "OFFENDER_MANAGER_CHANGED"
            }
          }
         }`
      )

      cy.task('verifyEndpointCalled', { verb: 'PUT', path: '/secure/users/JSMITH/roles/LHDCBT002', times: 1 })
      cy.task('verifyEndpointCalled', { verb: 'PUT', path: '/offender/crn/X1234/responsible-com', times: 1 })
      cy.task('verifyEndpointCalled', { verb: 'PUT', path: '/offender/crn/X1234/probation-team', times: 1 })
    })
  })

  describe('Prison events', () => {
    it('should listen to the SENTENCE_DATES-CHANGED event and call endpoint to update sentence dates', () => {
      cy.task('stubGetLicencesForOffender', { nomisId: 'G9786GC', status: 'APPROVED' })
      cy.task('stubGetPrisonerDetail')
      cy.task('stubUpdateSentenceDates')

      cy.task(
        'sendPrisonEvent',
        `{
          "Message": "{\\"offenderIdDisplay\\":\\"G9786GC\\"}",
          "MessageAttributes": {
            "eventType": {
              "Type": "String",
              "Value": "SENTENCE_DATES-CHANGED"
            }
          }
         }`
      )

      cy.task('verifyEndpointCalled', { verb: 'PUT', path: '/licence/id/1/sentence-dates', times: 1 })
    })

    it('should listen to the CONFIRMED_RELEASE_DATE-CHANGED event and call endpoint to update sentence dates', () => {
      cy.task('searchPrisonersByBookingIds')
      cy.task('stubGetLicencesForOffender', { nomisId: 'G9786GC', status: 'APPROVED' })
      cy.task('stubGetPrisonerDetail')
      cy.task('stubUpdateSentenceDates')

      cy.task(
        'sendPrisonEvent',
        `{
          "Message": "{\\"offenderIdDisplay\\":\\"G9786GC\\"}",
          "MessageAttributes": {
            "eventType": {
              "Type": "String",
              "Value": "CONFIRMED_RELEASE_DATE-CHANGED"
            }
          }
         }`
      )

      cy.task('verifyEndpointCalled', { verb: 'PUT', path: '/licence/id/1/sentence-dates', times: 1 })
    })
  })
})
