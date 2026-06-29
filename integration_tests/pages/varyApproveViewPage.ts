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

  checkResidentialChecksNotCompleted(reason: string) {
    cy.contains('Have you completed the residential address checks?').parent().should('contain.text', 'No')

    cy.contains('Enter a reason why address checks have not been completed').parent().should('contain.text', reason)
  }

  checkHdcCurfewDetails(address?: string, expectHours: boolean = true) {
    cy.contains('HDC curfew details amended').should('be.visible')

    if (address) {
      cy.get('.curfew-address').should('contain.text', address)
    }

    if (expectHours) {
      cy.get('.weekly-curfew-times').should('exist').and('not.be.empty')
    }
  }
}
