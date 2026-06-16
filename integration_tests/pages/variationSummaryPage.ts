import Page from './page'
import ConfirmationPage from './confirmation'

export default class VariationSummaryPage extends Page {
  private sendForApprovalButtonId = '[data-qa=send-for-approval]'

  private discardButtonId = '[data-qa=discard]'

  constructor() {
    super('variation-summary-page')
  }

  verifyPageHeading = (): VariationSummaryPage => {
    cy.contains('h1', 'Variation summary')
    return this
  }

  verifyVariationDetailsSection = (): VariationSummaryPage => {
    cy.contains('Variation details')
    return this
  }

  verifySpoAnswer = (expected: string): VariationSummaryPage => {
    cy.contains('Have you discussed this variation request with your SPO?').parent().should('contain.text', expected)
    return this
  }

  verifyVloAnswer = (expected: string): VariationSummaryPage => {
    cy.contains('Have you consulted with the victim liaison officer (VLO) for this case?')
      .parent()
      .should('contain.text', expected)
    return this
  }

  verifyReasonForVariation = (expected: string): VariationSummaryPage => {
    cy.contains('Reasons for the variation').parent().should('contain.text', expected)
    return this
  }

  verifyFeedbackFromApprover = (expected: string): VariationSummaryPage => {
    cy.contains('Feedback from approver').parent().should('contain.text', expected)
    return this
  }

  verifyActionButtons = (): VariationSummaryPage => {
    cy.get(this.sendForApprovalButtonId).should('be.visible').and('contain.text', 'Send for approval')

    cy.get(this.discardButtonId).should('be.visible').and('contain.text', 'Discard changes')

    return this
  }

  verifyAddedByAndOn = (addedBy: string, addedOn: string): VariationSummaryPage => {
    cy.contains('Reasons for the variation')
      .parent()
      .within(() => {
        cy.contains(`Added by ${addedBy}`).should('be.visible')
        cy.contains(`Added on ${addedOn}`).should('be.visible')
      })

    return this
  }

  clickSendForApproval = (): ConfirmationPage => {
    cy.task('stubGetPduHeads')
    cy.task('stubSubmitStatus')
    cy.get(this.sendForApprovalButtonId).click()
    return Page.verifyOnPage(ConfirmationPage)
  }
}
