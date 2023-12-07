import Page from './page'
import BespokeConditionsPage from './bespokeConditions'
import PssConditionsQuestionPage from './pssConditionsQuestion'

export default class BespokeConditionsQuestionPage extends Page {
  private yesRadioButtonId = '[value=Yes]'

  private noRadioButtonId = '[value=No]'

  private continueButtonId = '[data-qa=continue]'

  constructor() {
    super('bespoke-conditions-question-page')
  }

  selectYes = (): BespokeConditionsQuestionPage => {
    cy.get(this.yesRadioButtonId).click()
    return this
  }

  selectNo = (): BespokeConditionsQuestionPage => {
    cy.get(this.noRadioButtonId).click()
    return this
  }

  clickContinue = (): BespokeConditionsPage => {
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(BespokeConditionsPage)
  }

  clickContinueAfterNo = (): PssConditionsQuestionPage => {
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(PssConditionsQuestionPage)
  }
}
