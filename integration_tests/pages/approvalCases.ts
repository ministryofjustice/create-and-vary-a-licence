import Page from './page'
import ApprovalViewPage from './approvalView'
import ApprovalSearchPage from './approvalSearch'
import ChangeLocationPage from './changeLocationPage'

export default class ApprovalCasesPage extends Page {
  private approveLicenceButtonId = '#name-1 a'

  private changeLocationsLink = '[data-qa=change-location-link]'

  private recentlyApprovedTab = '[data-qa=recently-approved-link]'

  private approvalNeededTab = '[data-qa=approval-needed-link]'

  private searchTextInput = '#search'

  private searchButtonId = '[data-qa=search-button]'

  private urgentHighlightMessageClass = '.urgent-highlight-message'

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

  checkColumnSortIcon = (columnName: string, expectedSort: 'ascending' | 'descending' | 'none'): void => {
    cy.contains('th[scope="col"] button', columnName).parent('th').should('have.attr', 'aria-sort', expectedSort)
  }

  clickChangeLocationsLink = (): ChangeLocationPage => {
    cy.get(this.changeLocationsLink).click()
    return Page.verifyOnPage(ChangeLocationPage)
  }

  clickRecentlyApprovedLink = (): ApprovalCasesPage => {
    cy.get(this.recentlyApprovedTab).click()
    return Page.verifyOnPage(ApprovalCasesPage)
  }

  clickApprovalNeededTab = (): ApprovalCasesPage => {
    cy.get(this.approvalNeededTab).click()
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

  hasNotAllocatedYetTextForProbationPractitioner(index: number) {
    return this.hasProbationPractitioner(index, 'Not allocated yet')
  }

  hasProbationPractitioner(index: number, name: string) {
    cy.get(`#com-${index}`).contains(name)
    return this
  }

  getUrgentHighlightMessage = () => cy.get(this.urgentHighlightMessageClass)
}
