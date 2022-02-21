import Page from './page'
import SpoDiscussionPage from './spoDiscussionPage'

export default class ConfirmVariationPage extends Page {
  private yesRadioButtonId = '[value=Yes]'

  private continueButtonId = '[data-qa=continue]'

  constructor() {
    super('confirm-vary-question-page')
  }

  selectYes = (): ConfirmVariationPage => {
    cy.task('stubCreateVariation')
    cy.get(this.yesRadioButtonId).click()
    return this
  }

  clickContinue = (): SpoDiscussionPage => {
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(SpoDiscussionPage)
  }
}
