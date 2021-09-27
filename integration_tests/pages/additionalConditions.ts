import Page from './page'
import BespokeConditionsQuestionPage from './bespokeConditionsQuestion'

export default class AdditionalConditionsPage extends Page {
  private continueButtonId = '[data-qa=continue]'

  constructor() {
    super('additional-conditions-page', false)
  }

  clickContinue = (): BespokeConditionsQuestionPage => {
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(BespokeConditionsQuestionPage)
  }
}
