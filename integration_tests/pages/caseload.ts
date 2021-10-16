import Page from './page'
import AppointmentPersonPage from './appointmentPerson'

export default class CaseloadPage extends Page {
  private createLicenceButtonId = '#name-1'

  constructor() {
    super('caseload-page')
  }

  clickCreateLicence = (): AppointmentPersonPage => {
    cy.task('stubPostLicence')
    cy.get(this.createLicenceButtonId).click()
    return Page.verifyOnPage(AppointmentPersonPage)
  }
}
