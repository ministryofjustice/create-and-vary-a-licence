import Page from '../../pages/page'
import ContactProbationTeamPage from '../../pages/contactProbationTeamPage'

context('Time Served – Contact Probation Team', () => {
  const visitPage = (id = 1) => {
    cy.visit(`/licence/time-served/create/id/${id}/contact-probation-team`)
    return Page.verifyOnPage(ContactProbationTeamPage)
  }

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubPrisonSignIn')
    cy.task('stubGetPrisonUserDetails')
    cy.task('stubGetPrisonUserCaseloads', {
      details: [
        {
          caseLoadId: 'LEI',
          caseloadFunction: 'GENERAL',
          currentlyActive: true,
          description: 'Leeds (HMP)',
          type: 'INST',
        },
      ],
    })
    cy.task('stubGetCaseloadItemInHardStop')
    cy.task('stubFeComponents')
    cy.task('stubGetPrisons')
    cy.task('stubGetCompletedLicence', {
      statusCode: 'SUBMITTED',
      licenceStatus: 'TIMED_OUT',
      hardStopKind: 'TIME_SERVED',
    })
    cy.task('stubUpdateTimeServedExternalRecord')
    cy.task('stubGetTimeServedExternalRecordReasonNotSet')
    cy.signIn()
  })

  it('loads the contact probation team page', () => {
    // When
    const page = visitPage()

    // Then
    page.heading().should('contain', 'You must contact the probation team')
  })

  it('shows validation errors when nothing selected', () => {
    // Given
    const page = visitPage()

    // When
    page.continue()

    // Then
    page.errorSummary().should('contain', 'Confirm if you have contacted the probation team')
    page.errorSummary().should('contain', 'Choose a form of communication')
    page.radioContactStatusError().should('contain', 'Confirm if you have contacted the probation team')
    page.communicationMethodsError().should('contain', 'Choose a form of communication')
  })

  it('shows validation error for OTHER without detail', () => {
    // Given
    const page = visitPage()
    page.radioWillContactSoon().click()
    page.checkboxOther().click()

    // When
    page.continue()

    // Then
    page.errorSummary().should('contain', 'Enter a form of communication')
    page.otherCommunicationDetailError().should('contain', 'Enter a form of communication')
  })

  it('submits successfully with CANNOT_CONTACT and multiple methods', () => {
    // Given
    cy.task('stubAddTimeServedProbationConfirmContact')
    const page = visitPage()
    page.radioCannotContact().click()
    page.checkboxTeams().click()
    page.checkboxPhone().click()

    // When
    page.continue()

    // Then
    cy.url().should('include', '/licence/hard-stop/id/1/confirmation')
  })

  it('submits successfully with ALREADY_CONTACTED and all communication methods', () => {
    // Given
    cy.task('stubAddTimeServedProbationConfirmContact')
    const page = visitPage()
    page.radioAlreadyContacted().click()
    page.checkboxEmail().click()
    page.checkboxTeams().click()
    page.checkboxPhone().click()
    page.checkboxOther().click()
    page.otherDetail().type('Carrier pigeon')

    // When
    page.continue()

    // Then
    cy.url().should('include', '/licence/hard-stop/id/1/confirmation')
  })

  it('submits successfully with OTHER and detail only', () => {
    // Given
    cy.task('stubAddTimeServedProbationConfirmContact')
    const page = visitPage(2)
    page.radioWillContactSoon().click()
    page.checkboxOther().click()
    page.otherDetail().type('Smoke signals')

    // When
    page.continue()

    // Then
    cy.url().should('include', '/licence/hard-stop/id/2/confirmation')
  })
})
