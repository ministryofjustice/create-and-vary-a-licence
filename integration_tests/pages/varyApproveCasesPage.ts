import Page from './page'
import VaryApproveViewPage from './varyApproveViewPage'

export default class VaryApproveCasesPage extends Page {
  private varyApproveLinkId = '#name-link-1'

  constructor() {
    super('vary-approval-cases-page')
  }

  selectCase = (): VaryApproveViewPage => {
    cy.get(this.varyApproveLinkId).click()
    return Page.verifyOnPage(VaryApproveViewPage)
  }
}
