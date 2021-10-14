import Page from './page'
import ApprovalViewPage from './approvalView'

export default class ApprovalCasesPage extends Page {
  private approveLicenceButtonId = '#view-licence-1'

  constructor() {
    super('approval-cases-page')
  }

  clickApproveLicence = (): ApprovalViewPage => {
    cy.get(this.approveLicenceButtonId).click()
    return Page.verifyOnPage(ApprovalViewPage)
  }
}
