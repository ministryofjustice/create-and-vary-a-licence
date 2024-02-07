import Page from './page'
import AppointmentTimePage from './appointmentTime'
import ViewALicencePage from './viewALicence'

export default class AppointmentContactPage extends Page {
  private telephoneTextboxId = '#telephone'

  private continueButtonId = '[data-qa=continue]'

  constructor() {
    super('appointment-contact-page')
  }

  enterTelephone = (text: string): AppointmentContactPage => {
    cy.get(this.telephoneTextboxId).type(text)
    return this
  }

  clickContinue = (): AppointmentTimePage => {
    cy.task('stubPutContactNumber')
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(AppointmentTimePage)
  }

  clickContinueToReturn = (): ViewALicencePage => {
    cy.task('stubPutContactNumber')
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(ViewALicencePage)
  }
}
