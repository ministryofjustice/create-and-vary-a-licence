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
}
