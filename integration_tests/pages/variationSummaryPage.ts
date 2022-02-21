import Page from './page'
import ConfirmationPage from './confirmation'

export default class VariationSummaryPage extends Page {
  private sendForApprovalButtonId = '[data-qa=send-for-approval]'

  constructor() {
    super('variation-summary-page')
  }

  clickSendForApproval = (): ConfirmationPage => {
    cy.task('stubSubmitStatus')
    cy.get(this.sendForApprovalButtonId).click()
    return Page.verifyOnPage(ConfirmationPage)
  }
}
