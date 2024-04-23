import Page from './page'
import AppointmentPersonPage from './appointmentPerson'

export default class ConfirmCreatePage extends Page {
  private yesRadioButtonId = '[value=Yes]'

  private continueButtonId = '[data-qa=continue]'

  constructor() {
    super('confirm-create-page')
  }

  selectYes = (): ConfirmCreatePage => {
    cy.task('stubPostLicence')
    cy.get(this.yesRadioButtonId).click()
    return this
  }

  clickContinue = (): AppointmentPersonPage => {
    cy.task('stubGetStaffDetailsByStaffId')
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(AppointmentPersonPage)
  }
}
