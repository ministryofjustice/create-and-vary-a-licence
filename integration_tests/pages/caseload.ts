import Page from './page'
import AppointmentPersonPage from './appointmentPerson'
import CheckAnswersPage from './checkAnswers'

export default class CaseloadPage extends Page {
  private createLicenceButtonId = '#name-1'

  constructor() {
    super('caseload-page')
  }

  clickNameToCreateLicence = (): AppointmentPersonPage => {
    cy.task('stubPostLicence')
    cy.get(this.createLicenceButtonId).click()
    return Page.verifyOnPage(AppointmentPersonPage)
  }

  clickNameToEditLicence = (): CheckAnswersPage => {
    cy.task('stubExistingLicences')
    cy.task('stubGetCompletedLicence', 'APPROVED')
    cy.get(this.createLicenceButtonId).click()
    return Page.verifyOnPage(CheckAnswersPage)
  }
}
