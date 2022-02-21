import Page from './page'
import AdditionalConditionsPage from './additionalConditions'

export default class AdditionalConditionsQuestionPage extends Page {
  private yesRadioButtonId = '[value=Yes]'

  private continueButtonId = '[data-qa=continue]'

  constructor() {
    super('additional-conditions-question-page', false)
  }

  selectYes = (): AdditionalConditionsQuestionPage => {
    cy.get(this.yesRadioButtonId).click()
    return this
  }

  clickContinue = (): AdditionalConditionsPage => {
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(AdditionalConditionsPage)
  }
}
