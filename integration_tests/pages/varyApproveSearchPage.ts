import Page from './page'
import ComDetailsPage from './comDetails'
import VaryApproveViewPage from './varyApproveViewPage'
import VaryApproveCasesPage from './varyApproveCasesPage'

export default class VaryApprovalSearchPage extends Page {
  private searchHeading = '#vary-approval-search-heading'

  private pduCasesTabTitle = '#tab-heading-pdu-cases'

  private regionCasesTabTitle = '#tab-heading-region-cases'

  private probationPractionerLinkId = '[data-qa=comLink]'

  private licenceLinkId = '#name-link-1'

  private variationRequestDate = '[data-qa=variationRequestDate]'

  constructor() {
    super('vary-approval-search-page')
  }

  getSearchHeading = () => {
    return cy.get(this.searchHeading)
  }

  getPduCasesTabTitle = () => {
    return cy.get(this.pduCasesTabTitle)
  }

  getRegionCasesTabTitle = () => {
    return cy.get(this.regionCasesTabTitle)
  }

  getVariationRequestDate = n => {
    return cy.get(this.variationRequestDate).eq(n)
  }

  clickOnPduCasesTab = (): VaryApprovalSearchPage => {
    cy.get('#tab_pdu-cases').click()
    return Page.verifyOnPage(VaryApprovalSearchPage)
  }

  clickOnRegionCasesTab = (): VaryApprovalSearchPage => {
    cy.get('#tab_region-cases').click()
    return Page.verifyOnPage(VaryApprovalSearchPage)
  }

  clickOffenderName = (): VaryApproveViewPage => {
    cy.get(this.licenceLinkId).click()
    return Page.verifyOnPage(VaryApproveViewPage)
  }

  clickFirstComName = (): ComDetailsPage => {
    cy.task('stubGetStaffDetailsByStaffCode')
    cy.get(this.probationPractionerLinkId).first().click()
    return Page.verifyOnPage(ComDetailsPage)
  }

  clickBackToCaseload = (): VaryApproveCasesPage => {
    cy.get('.govuk-back-link').click()
    return Page.verifyOnPage(VaryApproveCasesPage)
  }
}
