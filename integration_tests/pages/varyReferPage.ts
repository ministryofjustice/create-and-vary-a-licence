import Page from './page'
import VaryReferConfirmPage from './varyReferConfirmPage'

export default class VaryReferPage extends Page {
  private referButtonId = '[data-qa=request-amendments]'

  constructor() {
    super('reason-for-referral-page')
  }

  enterReasonForReferral = (reason: string): VaryReferPage => {
    cy.get(`#reasonForReferral`).type(reason, { force: true })
    return this
  }

  clickConfirmReferral = (): VaryReferConfirmPage => {
    cy.task('stubSubmitStatus')
    cy.get(this.referButtonId).click()
    return Page.verifyOnPage(VaryReferConfirmPage)
  }

  expandVariationDetails = (): VaryReferPage => {
    cy.get('.govuk-details__summary').contains('View variation details').click()

    return this
  }

  checkHdcCurfewDetails = (address?: string, expectHours: boolean = false): VaryReferPage => {
    cy.contains('HDC curfew details amended').should('be.visible')

    if (address) {
      cy.get('.curfew-address').should('contain.text', address)
    }

    if (expectHours) {
      cy.get('.weekly-curfew-times').should('exist').and('not.be.empty')
    }
    return this
  }
}
