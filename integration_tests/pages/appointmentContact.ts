import Page from './page'
import AppointmentTimePage from './appointmentTime'
import ViewALicencePage from './viewALicence'

export default class AppointmentContactPage extends Page {
  private telephoneTextboxId = '#telephone'

  private telephoneAltTextboxId = '#telephoneAlternative'

  private continueButtonId = '[data-qa=continue]'

  constructor() {
    super('appointment-contact-page')
  }

  enterTelephone = (telephoneText: string, telephoneAltText: string = null): AppointmentContactPage => {
    cy.get(this.telephoneTextboxId).type(telephoneText)
    if (telephoneAltText !== null) {
      cy.get(this.telephoneAltTextboxId).type(telephoneAltText)
    }
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
