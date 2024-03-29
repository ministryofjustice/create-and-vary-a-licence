import Page from './page'
import ViewCasesPage from './viewCasesPage'
import ApprovalCasesPage from './approvalCases'

export default class ChangeLocationPage extends Page {
  constructor() {
    super('change-location-page')
  }

  clickContinue = () => {
    return cy.get('[data-qa=continue]').click()
  }

  clickCancelLink = (): ViewCasesPage => {
    cy.get('[data-qa=cancel-link]').click()
    return Page.verifyOnPage(ViewCasesPage)
  }

  clickCancelForApprover = (): ApprovalCasesPage => {
    cy.get('[href="/licence/approve/cases?approval=needed"]').click()
    return Page.verifyOnPage(ApprovalCasesPage)
  }

  getErrorSummary = () => {
    return cy.get('.govuk-error-summary__body')
  }

  clickCheckBox = prison => {
    cy.contains(prison).click()
  }
}
