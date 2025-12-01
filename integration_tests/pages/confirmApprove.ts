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

  checkThatPageHasTimeServedSubTextMessage = (): ConfirmApprovePage => {
    cy.get('[data-qa=approval-title-panel]').contains('Check a case administrator has contacted the probation team')
    return this
  }

  checkThatPageHasTimeServedEmailTextMessage = (): ConfirmApprovePage => {
    cy.get('[data-qa=email-message-text]').contains(
      'Check a case administrator has notified the probation team that this licence has been generated. We do not have their contact details to do this automatically.',
    )
    return this
  }

  checkThatPageHasTimeServedLicenceChangeMessageMessage = (): ConfirmApprovePage => {
    cy.get('[data-qa=licence-change-message]').contains(
      'Only the initial appointment can be changed. You will not need to approve the licence again',
    )
    return this
  }
}
