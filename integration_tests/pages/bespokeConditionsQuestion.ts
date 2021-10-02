import Page from './page'
import BespokeConditionsPage from './bespokeConditions'

export default class BespokeConditionsQuestionPage extends Page {
  private yesRadioButtonId = '[value=yes]'

  private continueButtonId = '[data-qa=continue]'

  constructor() {
    super('bespoke-conditions-question-page')
  }

  selectYes = (): BespokeConditionsQuestionPage => {
    cy.get(this.yesRadioButtonId).click()
    return this
  }

  clickContinue = (): BespokeConditionsPage => {
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(BespokeConditionsPage)
  }
}
