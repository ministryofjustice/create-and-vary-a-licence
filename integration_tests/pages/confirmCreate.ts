import Page from './page'
import AppointmentPersonPage from './appointmentPerson'

export default class ConfirmCreatePage extends Page {
  private continueButtonId = '[data-qa=continue]'

  constructor() {
    super('confirm-create-page')
  }

  clickContinue = (): AppointmentPersonPage => {
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(AppointmentPersonPage)
  }

  getReleaseDateStatus() {
    return cy.get('.release-date-row')
  }
}
