import Page from './page'
import ConfirmApprovePage from './confirmApprove'
import ConfirmRejectPage from './confirmReject'

export default class ApprovalViewPage extends Page {
  private approveLicenceButtonId = '[data-qa=approve-licence]'

  private rejectLicenceButtonId = '[data-qa=reject-licence]'

  constructor() {
    super('approval-view-page')
  }

  clickApprove = (): ConfirmApprovePage => {
    cy.get(this.approveLicenceButtonId).click()
    return Page.verifyOnPage(ConfirmApprovePage)
  }

  clickReject = (): ConfirmRejectPage => {
    cy.get(this.rejectLicenceButtonId).click()
    return Page.verifyOnPage(ConfirmRejectPage)
  }
}
