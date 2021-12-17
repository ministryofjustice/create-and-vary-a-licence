import Page from './page'
import ViewCasesPage from './viewCases'

export default class ComDetailsPage extends Page {
  constructor() {
    super('com-details-page')
  }

  clickReturn = (): ViewCasesPage => {
    cy.get('[data-qa=return]').click()
    return Page.verifyOnPage(ViewCasesPage)
  }
}
