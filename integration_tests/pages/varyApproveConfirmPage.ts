import Page from './page'
import VaryApproveCasesPage from './varyApproveCasesPage'

export default class VaryApproveConfirmPage extends Page {
  private approveButtonId = '[data-qa=return-to-vary-approve-cases]'

  constructor() {
    super('confirm-variation-approved-page')
  }

  clickBackToCaseList = (): VaryApproveCasesPage => {
    cy.get(this.approveButtonId).click()
    return Page.verifyOnPage(VaryApproveCasesPage)
  }
}
