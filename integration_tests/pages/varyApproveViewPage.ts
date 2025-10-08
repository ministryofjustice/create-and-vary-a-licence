import Page from './page'
import VaryApproveConfirmPage from './varyApproveConfirmPage'
import VaryApprovalSearchPage from './varyApproveSearchPage'
import VaryReferPage from './varyReferPage'

export default class VaryApproveViewPage extends Page {
  private approveButtonId = '[data-qa=approve-variation]'

  private referButtonId = '[data-qa=refer-variation]'

  constructor() {
    super('variation-summary-page')
  }

  clickApproveVariation = (): VaryApproveConfirmPage => {
    cy.task('stubSubmitStatus')
    cy.get(this.approveButtonId).click()
    return Page.verifyOnPage(VaryApproveConfirmPage)
  }

  clickReferVariation = (): VaryReferPage => {
    cy.get(this.referButtonId).click()
    return Page.verifyOnPage(VaryReferPage)
  }

  clickBackToVaryApproverSearch = (): VaryApprovalSearchPage => {
    cy.get('.govuk-back-link').click()
    return Page.verifyOnPage(VaryApprovalSearchPage)
  }
}
