import Page from './page'
import AppointmentPlacePage from './appointmentPlace'
import ViewALicencePage from './viewALicence'

export default class AppointmentPersonPage extends Page {
  private personTextInputId = '#contactName'

  private continueButtonId = '[data-qa=continue]'

  constructor() {
    super('appointment-person-page')
  }

  selectAppointmentPersonType = (type: number): AppointmentPersonPage => {
    cy.get(`#appointmentPersonType-${type}`).click()
    return this
  }

  enterPerson = (text: string): AppointmentPersonPage => {
    cy.get(this.personTextInputId).type(text)
    return this
  }

  clickContinue = (): AppointmentPlacePage => {
    cy.task('stubPutAppointmentPerson')
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(AppointmentPlacePage)
  }

  clickContinueToReturn = (): ViewALicencePage => {
    cy.task('stubPutAppointmentPerson')
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(ViewALicencePage)
  }
}
