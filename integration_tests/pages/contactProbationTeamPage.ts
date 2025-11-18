import Page from './page'

export default class ContactProbationTeamPage extends Page {
  constructor() {
    super('time-served-contact-probation-page')
  }

  heading() {
    return cy.get('h1')
  }

  radioAlreadyContacted() {
    return cy.get('[data-qa="already-contacted"]')
  }

  radioWillContactSoon() {
    return cy.get('[data-qa="will-contact-soon"]')
  }

  radioCannotContact() {
    return cy.get('[data-qa="cannot-contact"]')
  }

  checkboxEmail() {
    return cy.get('[data-qa="method-email"]')
  }

  checkboxTeams() {
    return cy.get('[data-qa="method-teams"]')
  }

  checkboxPhone() {
    return cy.get('[data-qa="method-phone"]')
  }

  checkboxOther() {
    return cy.get('[data-qa="method-other"]')
  }

  otherDetail() {
    return cy.get('[data-qa="other-detail"]')
  }

  continue() {
    return cy.get('[data-qa="continue"]').click()
  }

  errorSummary() {
    return cy.get('.govuk-error-summary')
  }

  radioContactStatusError() {
    return cy.get('#contactStatus-error')
  }

  communicationMethodsError() {
    return cy.get('#communicationMethods-error')
  }

  otherCommunicationDetailError() {
    return cy.get('#otherCommunicationDetail-error')
  }
}
