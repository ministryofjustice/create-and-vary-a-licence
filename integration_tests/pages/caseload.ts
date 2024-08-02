import Page from './page'
import CheckAnswersPage from './checkAnswers'
import ComDetailsPage from './comDetails'
import ConfirmCreatePage from './confirmCreate'
import SearchPage from './search'
import PrisonWillCreateLicencePage from './prisonWillCreateLicencePage'
import LicenceNotApprovedInTimePage from './licenceNotApprovedInTimePage'
import HardStopLicencePage from './hardStopLicencePage'

export default class CaseloadPage extends Page {
  private createLicenceButtonId = '#name-button-1'

  private searchTextInput = '#search'

  private searchButtonId = '[data-qa=search-button]'

  constructor() {
    super('caseload-page')
  }

  clickNameToCreateLicence = (): ConfirmCreatePage => {
    cy.get(this.createLicenceButtonId).click()
    return Page.verifyOnPage(ConfirmCreatePage)
  }

  clickNameToEditLicence = (): CheckAnswersPage => {
    cy.task('stubGetCompletedLicence', { statusCode: 'APPROVED', typeCode: 'AP_PSS' })
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

  clickSearch = (text: string): SearchPage => {
    cy.task('stubGetProbationSearchResults')
    cy.get(this.searchTextInput).type(text)
    cy.get(this.searchButtonId).click()
    return Page.verifyOnPage(SearchPage)
  }
}
