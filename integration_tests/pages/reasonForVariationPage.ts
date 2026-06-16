import Page from './page'
import VariationSummaryPage from './variationSummaryPage'

export default class ReasonForVariationPage extends Page {
  private reasonTextArea = '#reasonForVariation'

  private continueButtonId = '[data-qa=continue]'

  constructor() {
    super('reason-for-variation-page')
  }

  verifyGuidanceText = (): ReasonForVariationPage => {
    cy.contains('Add a short explanation for everything you want to vary').should('be.visible')
    cy.contains("why the changes are being made now and why they're necessary to manage risk").should('be.visible')
    cy.contains('who you have consulted about the changes and if they support your decision').should('be.visible')
    return this
  }

  enterReason = (text: string): ReasonForVariationPage => {
    cy.get(this.reasonTextArea).type(text, { force: true })
    return this
  }

  clickContinue = (): VariationSummaryPage => {
    cy.task('stubUpdateReasonForVariation')
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(VariationSummaryPage)
  }
}
