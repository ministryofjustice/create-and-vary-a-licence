import Page from './page'
import CheckAnswersPage from './checkAnswers'
import ComDetailsPage from './comDetails'
import ConfirmCreatePage from './confirmCreate'

export default class CaseloadPage extends Page {
  private createLicenceButtonId = '#name-button-1'

  constructor() {
    super('caseload-page')
  }

  clickNameToCreateLicence = (): ConfirmCreatePage => {
    cy.get(this.createLicenceButtonId).click()
    return Page.verifyOnPage(ConfirmCreatePage)
  }

  clickNameToEditLicence = (): CheckAnswersPage => {
    cy.task('stubGetExistingLicenceForOffenderWithResult')
    cy.task('stubGetCompletedLicence', { statusCode: 'APPROVED', typeCode: 'AP_PSS' })
    cy.get(this.createLicenceButtonId).click()
    return Page.verifyOnPage(CheckAnswersPage)
  }

  clickComName = (): ComDetailsPage => {
    cy.task('stubGetStaffDetailsByStaffCode')
    cy.contains('td a', 'John Smith').click()
    return Page.verifyOnPage(ComDetailsPage)
  }
}
