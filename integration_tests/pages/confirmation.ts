import Page from './page'
import CaseloadPage from './caseload'

export default class ConfirmationPage extends Page {
  private returnButtonId = '[data-qa=return-to-caselist]'

  constructor() {
    super('confirmation-page')
  }

  clickReturn = (): CaseloadPage => {
    cy.task('stubGetLicencesForOffender', { nomisId: 'G9786GC', status: 'SUBMITTED' })
    cy.get(this.returnButtonId).click()
    return Page.verifyOnPage(CaseloadPage)
  }

  clickReturnPss = (): CaseloadPage => {
    cy.task('stubGetPssLicencesForOffender', { nomisId: 'G9786GC', status: 'SUBMITTED' })
    cy.get(this.returnButtonId).click()
    return Page.verifyOnPage(CaseloadPage)
  }
}
