import Page from './page'
import AppointmentPlacePage from './appointmentPlace'

export default class AppointmentPersonPage extends Page {
  private personTextInputId = '#contactName'

  private continueButtonId = '[data-qa=continue]'

  constructor() {
    super('appointment-person-page')
  }

  enterPerson = (text: string): AppointmentPersonPage => {
    cy.get(this.personTextInputId).clear().type(text)
    return this
  }

  clickContinue = (): AppointmentPlacePage => {
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(AppointmentPlacePage)
  }
}
