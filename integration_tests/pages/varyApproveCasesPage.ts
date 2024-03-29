import Page from './page'
import VaryApproveViewPage from './varyApproveViewPage'

export default class VaryApproveCasesPage extends Page {
  private varyApproveLinkId = '#name-link-1'

  private allRegionsId = '#allRegions'

  constructor() {
    super('vary-approval-cases-page')
  }

  selectCase = (): VaryApproveViewPage => {
    cy.get(this.varyApproveLinkId).click()
    return Page.verifyOnPage(VaryApproveViewPage)
  }

  clickViewAllRegions = (): VaryApproveCasesPage => {
    cy.get(this.allRegionsId).click()
    return Page.verifyOnPage(VaryApproveCasesPage)
  }
}
