import { addDays, format } from 'date-fns'

context('Event handlers', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('purgeQueues')
    cy.task('stubSystemToken')
    cy.task('stubDeactivateLicenceAndVariations')
  })

  describe('Domain events', () => {
    it('should listen to the released event and call endpoint to update licence status to ACTIVE', () => {
      cy.task('searchPrisonersByBookingIds')
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

    it('should listen to the offender updated event and call the prison API endpoint to update offender details', () => {
      cy.task('stubGetPrisonerDetail')
      cy.task('stubUpdateOffenderDetails')

      cy.task(
        'sendDomainEvent',
        `{
          "Message": "{\\"additionalInformation\\": {\\"nomsNumber\\":\\"G9786GC\\", \\"categoriesChanged\\":[\\"PERSONAL_DETAILS\\",\\"SOME_OTHER_CATEGORY\\"]}}",
          "MessageAttributes": {
            "eventType": {
              "Type": "String",
              "Value": "prisoner-offender-search.prisoner.updated"
            }
          }
         }`,
      )

      cy.task('verifyEndpointCalled', {
        verb: 'PUT',
        path: '/licences-api/offender/nomisid/G9786GC/update-offender-details',
        times: 1,
      })
    })

    it('should ignore the offender updated event if the categoriesChanged does not include "PERSONAL_DETAILS"', () => {
      cy.task('stubGetPrisonerDetail')
      cy.task('stubUpdateOffenderDetails')

      cy.task(
        'sendDomainEvent',
        `{
          "Message": "{\\"additionalInformation\\": {\\"nomsNumber\\":\\"G9786GC\\", \\"categoriesChanged\\":[\\"SOME_OTHER_CATEGORY\\"]}}",
          "MessageAttributes": {
            "eventType": {
              "Type": "String",
              "Value": "prisoner-offender-search.prisoner.updated"
            }
          }
         }`,
      )

      cy.task('verifyEndpointCalled', {
        verb: 'PUT',
        path: '/licences-api/offender/nomisid/G9786GC/update-offender-details',
        times: 0,
      })
    })
  })

  describe('Prison events', () => {
    it('should listen to the SENTENCE_DATES-CHANGED event and call endpoint to update sentence dates', () => {
      cy.task('stubGetLicencesForOffender', { nomisId: 'G9786GC', status: 'APPROVED' })
      cy.task('stubGetActiveAndVariationLicencesForOffender')
      cy.task('stubGetPrisonerDetail')
      cy.task('stubUpdateSentenceDates')
      cy.task('stubGetPrisonerSentencesAndOffences')

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
         }`,
      )

      cy.task('verifyEndpointCalled', { verb: 'PUT', path: '/licences-api/licence/id/1/sentence-dates', times: 1 })
    })

    it('should listen to the SENTENCE_DATES-CHANGED event and call endpoint to deactivate licence with status ACTIVE if prisoner has been re-sentenced', () => {
      cy.task('stubGetActiveAndVariationLicencesForOffender', { nomisId: 'G9786GC', status: 'ACTIVE' })
      cy.task('stubGetPrisonerDetail')
      cy.task('stubUpdateSentenceDates')
      cy.task('stubUpdateLicenceStatus')
      cy.task('stubGetPrisonerSentencesAndOffences')

      cy.task(
        'sendPrisonEvent',
        `{
          "Message": "{\\"bookingId\\":1234,\\"offenderIdDisplay\\":\\"G9786GC\\"}",
          "MessageAttributes": {
            "eventType": {
              "Type": "String",
              "Value": "SENTENCE_DATES-CHANGED"
            }
          }
         }`,
      )

      cy.task('verifyEndpointCalled', {
        verb: 'POST',
        path: '/licences-api/licence/id/1/deactivate-licence-and-variations',
        times: 1,
      })
      cy.task('verifyEndpointCalled', { verb: 'PUT', path: '/licences-api/licence/id/1/sentence-dates', times: 0 })
    })

    it('should listen to the SENTENCE_DATES-CHANGED event and call endpoint to deactivate licence with status VARIATION_IN_PROGRESS if prisoner has been re-sentenced', () => {
      cy.task('stubGetActiveAndVariationLicencesForOffender', { nomisId: 'G9786GC', status: 'VARIATION_IN_PROGRESS' })
      cy.task('stubGetPrisonerDetail')
      cy.task('stubUpdateSentenceDates')
      cy.task('stubUpdateLicenceStatus')
      cy.task('stubGetPrisonerSentencesAndOffences')

      cy.task(
        'sendPrisonEvent',
        `{
          "Message": "{\\"bookingId\\":1234,\\"offenderIdDisplay\\":\\"G9786GC\\"}",
          "MessageAttributes": {
            "eventType": {
              "Type": "String",
              "Value": "SENTENCE_DATES-CHANGED"
            }
          }
         }`,
      )

      cy.task('verifyEndpointCalled', {
        verb: 'POST',
        path: '/licences-api/licence/id/1/deactivate-licence-and-variations',
        times: 1,
      })
      cy.task('verifyEndpointCalled', { verb: 'PUT', path: '/licences-api/licence/id/1/sentence-dates', times: 0 })
    })

    it('should listen to the SENTENCE_DATES-CHANGED event and call endpoint to deactivate licence with status ACTIVE if the PRRD is changed to be in the future', () => {
      cy.task('stubGetActiveAndVariationLicencesForOffender', { nomisId: 'G9786GC', status: 'ACTIVE' })
      cy.task('stubGetRecalledPrisonerDetail', format(addDays(new Date(), 2), 'yyyy-MM-dd'))
      cy.task('stubUpdateSentenceDates')
      cy.task('stubUpdateLicenceStatus')
      cy.task('stubGetPrisonerSentencesAndOffencesWithPastSsd')

      cy.task(
        'sendPrisonEvent',
        `{
          "Message": "{\\"bookingId\\":1234,\\"offenderIdDisplay\\":\\"G9786GC\\"}",
          "MessageAttributes": {
            "eventType": {
              "Type": "String",
              "Value": "SENTENCE_DATES-CHANGED"
            }
          }
         }`,
      )

      cy.task('verifyEndpointCalled', {
        verb: 'POST',
        path: '/licences-api/licence/id/1/deactivate-licence-and-variations',
        times: 1,
      })
      cy.task('verifyEndpointCalled', { verb: 'PUT', path: '/licences-api/licence/id/1/sentence-dates', times: 0 })
    })

    it('should listen to the SENTENCE_DATES-CHANGED event and call endpoint to deactivate licence with status VARIATION_IN_PROGRESS if the PRRD is changed to be in the future', () => {
      cy.task('stubGetActiveAndVariationLicencesForOffender', { nomisId: 'G9786GC', status: 'VARIATION_IN_PROGRESS' })
      cy.task('stubGetRecalledPrisonerDetail', format(addDays(new Date(), 2), 'yyyy-MM-dd'))
      cy.task('stubUpdateSentenceDates')
      cy.task('stubUpdateLicenceStatus')
      cy.task('stubGetPrisonerSentencesAndOffencesWithPastSsd')

      cy.task(
        'sendPrisonEvent',
        `{
          "Message": "{\\"bookingId\\":1234,\\"offenderIdDisplay\\":\\"G9786GC\\"}",
          "MessageAttributes": {
            "eventType": {
              "Type": "String",
              "Value": "SENTENCE_DATES-CHANGED"
            }
          }
         }`,
      )

      cy.task('verifyEndpointCalled', {
        verb: 'POST',
        path: '/licences-api/licence/id/1/deactivate-licence-and-variations',
        times: 1,
      })
      cy.task('verifyEndpointCalled', { verb: 'PUT', path: '/licences-api/licence/id/1/sentence-dates', times: 0 })
    })

    it('should listen to the SENTENCE_DATES-CHANGED event and should not call endpoint to deactivate licence with status ACTIVE if the PRRD is changed to be today', () => {
      cy.task('stubGetActiveAndVariationLicencesForOffender', { nomisId: 'G9786GC', status: 'ACTIVE' })
      cy.task('stubGetRecalledPrisonerDetail', format(new Date(), 'yyyy-MM-dd'))
      cy.task('stubUpdateSentenceDates')
      cy.task('stubUpdateLicenceStatus')
      cy.task('stubGetPrisonerSentencesAndOffencesWithPastSsd')

      cy.task(
        'sendPrisonEvent',
        `{
          "Message": "{\\"bookingId\\":1234,\\"offenderIdDisplay\\":\\"G9786GC\\"}",
          "MessageAttributes": {
            "eventType": {
              "Type": "String",
              "Value": "SENTENCE_DATES-CHANGED"
            }
          }
         }`,
      )

      cy.task('verifyEndpointCalled', {
        verb: 'POST',
        path: '/licences-api/licence/id/1/deactivate-licence-and-variations',
        times: 0,
      })
      cy.task('verifyEndpointCalled', { verb: 'PUT', path: '/licences-api/licence/id/1/sentence-dates', times: 0 })
    })

    it('should listen to the CONFIRMED_RELEASE_DATE-CHANGED event and call endpoint to update sentence dates', () => {
      cy.task('searchPrisonersByBookingIds')
      cy.task('stubGetLicencesForOffender', { nomisId: 'G9786GC', status: 'APPROVED' })
      cy.task('stubGetActiveAndVariationLicencesForOffender')
      cy.task('stubGetPrisonerDetail')
      cy.task('stubUpdateSentenceDates')
      cy.task('stubGetPrisonerSentencesAndOffences')

      cy.task(
        'sendPrisonEvent',
        `{
          "Message": "{\\"bookingId\\":1234,\\"offenderIdDisplay\\":\\"G9786GC\\"}",
          "MessageAttributes": {
            "eventType": {
              "Type": "String",
              "Value": "CONFIRMED_RELEASE_DATE-CHANGED"
            }
          }
         }`,
      )

      cy.task('verifyEndpointCalled', { verb: 'PUT', path: '/licences-api/licence/id/1/sentence-dates', times: 1 })
    })
  })
})
