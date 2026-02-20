import Page from './page'
import ViewCasesPage from './viewCasesPage'
import CaseloadPage from './caseload'
import SearchPage from './comSearch'
import CaSearchPage from './caSearch'
import ApprovalSearchPage from './approvalSearch'
import VaryApprovalSearchPage from './varyApproveSearchPage'
import VaryCasesPage from './varyCases'

export default class ComDetailsPage extends Page {
  constructor() {
    super('com-details-page')
  }

  clickBackToSearch = (): SearchPage => {
    cy.get('.govuk-back-link').click()
    return Page.verifyOnPage(SearchPage)
  }

  clickBackToCaSearch = (): CaSearchPage => {
    cy.get('.govuk-back-link').click()
    return Page.verifyOnPage(CaSearchPage)
  }

  clickBackToPrisonApproverSearch = (): ApprovalSearchPage => {
    cy.get('.govuk-back-link').click()
    return Page.verifyOnPage(ApprovalSearchPage)
  }

  clickBackToVaryCaseload = (): VaryCasesPage => {
    cy.get('.govuk-back-link').click()
    return Page.verifyOnPage(VaryCasesPage)
  }

  clickBackToVaryApproverSearch = (): VaryApprovalSearchPage => {
    cy.get('.govuk-back-link').click()
    return Page.verifyOnPage(VaryApprovalSearchPage)
  }

  clickReturn = (): ViewCasesPage => {
    cy.get('[data-qa=return]').click()
    return Page.verifyOnPage(ViewCasesPage)
  }

  clickReturnToCaseload = (): CaseloadPage => {
    cy.get('[data-qa=return]').click()
    return Page.verifyOnPage(CaseloadPage)
  }
}
