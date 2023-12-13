import Page from './page'
import AdditionalConditionsPage from './additionalConditions'
import BespokeConditionsQuestionPage from './bespokeConditionsQuestion'

export default class AdditionalConditionsQuestionPage extends Page {
  private yesRadioButtonId = '[value=Yes]'

  private noRadioButtonId = '[value=No]'

  private continueButtonId = '[data-qa=continue]'

  constructor() {
    super('additional-conditions-question-page', false)
  }

  selectYes = (): AdditionalConditionsQuestionPage => {
    cy.get(this.yesRadioButtonId).click()
    return this
  }

  selectNo = (): AdditionalConditionsQuestionPage => {
    cy.get(this.noRadioButtonId).click()
    return this
  }

  clickContinue = (): AdditionalConditionsPage => {
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(AdditionalConditionsPage)
  }

  clickContinueAfterNo = (): BespokeConditionsQuestionPage => {
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(BespokeConditionsQuestionPage)
  }
}
