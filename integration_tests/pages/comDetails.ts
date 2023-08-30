import Page from './page'
import ViewCasesPage from './viewCasesPage'
import CaseloadPage from './caseload'
import SearchPage from './search'

export default class ComDetailsPage extends Page {
  constructor() {
    super('com-details-page')
  }

  clickBackToSearch = (): SearchPage => {
    cy.get('.govuk-back-link').click()
    return Page.verifyOnPage(SearchPage)
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
