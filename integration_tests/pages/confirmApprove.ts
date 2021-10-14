import Page from './page'
import ApprovalCasesPage from './approvalCases'

export default class ConfirmApprovePage extends Page {
  private returnToListButtonId = '[data-qa=return-to-case-list]'

  constructor() {
    super('confirm-approve-page')
  }

  clickReturnToList = (): ApprovalCasesPage => {
    cy.get(this.returnToListButtonId).click()
    return Page.verifyOnPage(ApprovalCasesPage)
  }
}
