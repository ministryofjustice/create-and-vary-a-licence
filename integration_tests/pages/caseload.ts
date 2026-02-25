import Page from './page'
import CheckAnswersPage from './checkAnswers'
import ComDetailsPage from './comDetails'
import ConfirmCreatePage from './confirmCreate'
import SearchPage from './comSearch'
import PrisonWillCreateLicencePage from './prisonWillCreateLicencePage'
import LicenceNotApprovedInTimePage from './licenceNotApprovedInTimePage'
import HardStopLicencePage from './hardStopLicencePage'
import RestrictedDetailsPage from './restrictedDetails'

export default class CaseloadPage extends Page {
  private createLicenceButtonId = '#name-button-1'

  private licenceStatusId = '#licence-status-'

  private searchTextInput = '#search'

  private searchButtonId = '[data-qa=search-button]'

  constructor() {
    super('caseload-page')
  }

  clickNameToCreateLicence = (): ConfirmCreatePage => {
    cy.get(this.createLicenceButtonId).click()
    return Page.verifyOnPage(ConfirmCreatePage)
  }

  clickNameToEditLicence(): CheckAnswersPage {
    cy.task('stubGetCompletedLicence', {
      statusCode: 'APPROVED',
      typeCode: 'AP_PSS',
      appointmentTelephoneNumber: '01234567890',
      appointmentAlternativeTelephoneNumber: '09876543210',
    })

    cy.get(this.createLicenceButtonId).click()
    return Page.verifyOnPage(CheckAnswersPage)
  }

  clickNameOfTimedOutLicence = (): PrisonWillCreateLicencePage => {
    cy.get(this.createLicenceButtonId).click()
    return Page.verifyOnPage(PrisonWillCreateLicencePage)
  }

  clickNameOfTimedOutEdit = (): LicenceNotApprovedInTimePage => {
    cy.get(this.createLicenceButtonId).click()
    return Page.verifyOnPage(LicenceNotApprovedInTimePage)
  }

  clickNameOfHardStopLicence = (): HardStopLicencePage => {
    cy.get(this.createLicenceButtonId).click()
    return Page.verifyOnPage(HardStopLicencePage)
  }

  clickComName = (): ComDetailsPage => {
    cy.task('stubGetStaffDetailsByStaffCode')
    cy.contains('td a', 'John Smith').click()
    return Page.verifyOnPage(ComDetailsPage)
  }

  clickRestrictedName = (): RestrictedDetailsPage => {
    cy.task('stubGetCaseAccessDetails')
    cy.contains('td a', 'Restricted').click()
    return Page.verifyOnPage(RestrictedDetailsPage)
  }

  clickSearch = (text: string): SearchPage => {
    cy.get(this.searchTextInput).type(text)
    cy.get(this.searchButtonId).click()
    return Page.verifyOnPage(SearchPage)
  }

  getRow = (row: number) => {
    return cy.get('tbody tr').eq(row)
  }

  getLicenceStatusByIndex = (index: number) => cy.get(this.licenceStatusId + index)
}
