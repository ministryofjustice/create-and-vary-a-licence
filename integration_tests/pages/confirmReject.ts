import Page from './page'
import ApprovalCasesPage from './approvalCases'

export default class ConfirmRejectPage extends Page {
  private returnToListButtonId = '[data-qa=return-to-case-list]'

  constructor() {
    super('confirm-reject-page')
  }

  clickReturnToList = (): ApprovalCasesPage => {
    cy.get(this.returnToListButtonId).click()
    return Page.verifyOnPage(ApprovalCasesPage)
  }
}
