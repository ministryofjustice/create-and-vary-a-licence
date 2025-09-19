import Page from './page'
import ApprovalViewPage from './approvalView'
import ApprovalCasesPage from './approvalCases'
import ChangeLocationPage from './changeLocationPage'
import ComDetailsPage from './comDetails'

export default class ApprovalSearchPage extends Page {
  private searchHeading = '#approval-search-heading'

  private approvalNeededTabTitle = '#tab-heading-approval-needed'

  private recentlyApprovedTabTitle = '#tab-heading-recently-approved'

  private probationPractionerLinkId = '[data-qa=comLink]'

  private licenceLinkId = '#name-1'

  private releaseDate = '[data-qa=releaseDate]'

  private approvedOnDate = '[data-qa=approvedOnDate]'

  private changeLocationsLink = '[data-qa=change-location-link]'

  constructor() {
    super('approval-search-page')
  }

  getSearchHeading = () => {
    return cy.get(this.searchHeading)
  }

  getApprovalNeededTabTitle = () => {
    return cy.get(this.approvalNeededTabTitle)
  }

  getRecentlyApprovedTabTitle = () => {
    return cy.get(this.recentlyApprovedTabTitle)
  }

  getOffenderName = () => {
    return cy.get(this.licenceLinkId)
  }

  getReleaseDate = n => {
    return cy.get(this.releaseDate).eq(n)
  }

  getApprovalDate = n => {
    return cy.get(this.approvedOnDate).eq(n)
  }

  clickOffenderName = (): ApprovalViewPage => {
    cy.get(this.licenceLinkId).click()
    return Page.verifyOnPage(ApprovalViewPage)
  }

  clickFirstComName = (): ComDetailsPage => {
    cy.task('stubGetStaffDetailsByStaffCode')
    cy.get(this.probationPractionerLinkId).first().click()
    return Page.verifyOnPage(ComDetailsPage)
  }

  clickBackToCaseload = (): ApprovalCasesPage => {
    cy.get('.govuk-back-link').click()
    return Page.verifyOnPage(ApprovalCasesPage)
  }

  clickOnApprovalNeededTab = (): ApprovalSearchPage => {
    cy.get('#tab_approval-needed').click()
    return Page.verifyOnPage(ApprovalSearchPage)
  }

  clickOnRecentlyApprovedTab = (): ApprovalSearchPage => {
    cy.get('#tab_recently-approved').click()
    return Page.verifyOnPage(ApprovalSearchPage)
  }

  getChangeCaseloadOption = () => {
    return cy.get('[data-qa=change-caseload]')
  }

  getCaseloadNames = () => {
    return cy.get('[data-qa=caseload-names]')
  }

  clickChangeLocationsLink = (): ChangeLocationPage => {
    cy.get(this.changeLocationsLink).click()
    return Page.verifyOnPage(ChangeLocationPage)
  }
}
