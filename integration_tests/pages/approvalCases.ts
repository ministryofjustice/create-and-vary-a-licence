import Page from './page'
import ApprovalViewPage from './approvalView'
import ApprovalSearchPage from './approvalSearch'
import ChangeLocationPage from './changeLocationPage'

export default class ApprovalCasesPage extends Page {
  private approveLicenceButtonId = '#name-1 a'

  private changeLocationsLink = '[data-qa=change-location-link]'

  private recentlyApprovedTab = '[data-qa=recently-approved-link]'

  private searchTextInput = '#search'

  private searchButtonId = '[data-qa=search-button]'

  constructor() {
    super('approval-cases-page')
  }

  clickSearch = (text: string): ApprovalSearchPage => {
    cy.get(this.searchTextInput).type(text)
    cy.get(this.searchButtonId).click()
    return Page.verifyOnPage(ApprovalSearchPage)
  }

  clickApproveLicence = (): ApprovalViewPage => {
    cy.get(this.approveLicenceButtonId).click()
    return Page.verifyOnPage(ApprovalViewPage)
  }

  clickChangeLocationsLink = (): ChangeLocationPage => {
    cy.get(this.changeLocationsLink).click()
    return Page.verifyOnPage(ChangeLocationPage)
  }

  clickRecentlyApprovedLink = (): ApprovalCasesPage => {
    cy.get(this.recentlyApprovedTab).click()
    return Page.verifyOnPage(ApprovalCasesPage)
  }

  getCaseloadNames = () => {
    return cy.get('[data-qa=caseload-names]')
  }

  getChangeCaseloadOption = () => {
    return cy.get('[data-qa=change-caseload]')
  }

  getTableRows = () => {
    return cy.get('tbody tr')
  }
}
