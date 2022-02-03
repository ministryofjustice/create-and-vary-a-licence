import Page from './page'
import AppointmentPersonPage from './appointmentPerson'
import CheckAnswersPage from './checkAnswers'
import ComDetailsPage from './comDetails'

export default class CaseloadPage extends Page {
  private createLicenceButtonId = '#name-button-1'

  constructor() {
    super('caseload-page')
  }

  clickNameToCreateLicence = (): AppointmentPersonPage => {
    cy.task('stubGetExistingLicenceForOffenderNoResult')
    cy.task('stubPostLicence')
    cy.get(this.createLicenceButtonId).click()
    return Page.verifyOnPage(AppointmentPersonPage)
  }

  clickNameToEditLicence = (): CheckAnswersPage => {
    cy.task('stubGetExistingLicenceForOffenderWithResult')
    cy.task('stubGetCompletedLicence', 'APPROVED')
    cy.get(this.createLicenceButtonId).click()
    return Page.verifyOnPage(CheckAnswersPage)
  }

  clickComName = (): ComDetailsPage => {
    cy.task('stubGetStaffDetailsByStaffId')
    cy.contains('td a', 'John Smith').click()
    return Page.verifyOnPage(ComDetailsPage)
  }
}
