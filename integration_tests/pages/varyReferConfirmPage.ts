import Page from './page'
import VaryApproveCasesPage from './varyApproveCasesPage'

export default class VaryReferConfirmPage extends Page {
  private caseListButtonId = '[data-qa=return-to-vary-approve-cases]'

  constructor() {
    super('variation-referred-page')
  }

  clickBackToCaseList = (): VaryApproveCasesPage => {
    cy.get(this.caseListButtonId).click()
    return Page.verifyOnPage(VaryApproveCasesPage)
  }
}
