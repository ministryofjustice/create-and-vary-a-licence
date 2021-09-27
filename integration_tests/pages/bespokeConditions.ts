import Page from './page'
import CheckAnswersPage from './checkAnswers'

export default class BespokeConditionsPage extends Page {
  private continueButtonId = '[data-qa=continue]'

  constructor() {
    super('bespoke-conditions-page')
  }

  clickContinue = (): CheckAnswersPage => {
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(CheckAnswersPage)
  }
}
