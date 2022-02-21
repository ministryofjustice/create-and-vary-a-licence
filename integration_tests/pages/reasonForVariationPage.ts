import Page from './page'
import VariationSummaryPage from './variationSummaryPage'

export default class ReasonForVariationPage extends Page {
  private reasonTextArea = '#reasonForVariation'

  private continueButtonId = '[data-qa=continue]'

  constructor() {
    super('reason-for-variation-page')
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
