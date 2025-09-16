import Page from './page'
import AppointmentTimePage from './appointmentTime'
import ViewALicencePage from './viewALicence'
import CheckAnswersPage from './checkAnswers'

export default class AppointmentContactPage extends Page {
  private telephoneTextboxId = '#telephone'

  private telephoneAltTextboxId = '#telephoneAlternative'

  private continueButtonId = '[data-qa=continue]'

  constructor() {
    super('appointment-contact-page')
  }

  enterTelephone = (telephoneText?: string, telephoneAltText?: string): AppointmentContactPage => {
    const typeText = (selector: string, value?: string) => {
      if (value !== undefined && value !== null) {
        cy.get(selector).clear({ force: true })
        cy.get(selector).type(value, { force: true })
      }
    }
    typeText(this.telephoneTextboxId, telephoneText)
    typeText(this.telephoneAltTextboxId, telephoneAltText)
    return this
  }

  clickContinue = (): AppointmentTimePage => {
    cy.task('stubPutContactNumber')
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(AppointmentTimePage)
  }

  clickContinueToReturnToViewLicencePage = (): ViewALicencePage => {
    cy.task('stubPutContactNumber')
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(ViewALicencePage)
  }

  clickContinueToReturnToCheckAnswersPage = (): CheckAnswersPage => {
    cy.task('stubPutContactNumber')
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(CheckAnswersPage)
  }
}
