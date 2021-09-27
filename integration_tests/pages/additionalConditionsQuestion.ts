import Page from './page'
import AdditionalConditionsPage from './additionalConditions'

export default class AdditionalConditionsQuestionPage extends Page {
  private yesRadioButtonId = '[value=yes]'

  private continueButtonId = '[data-qa=continue]'

  constructor() {
    super('additional-conditions-question-page', false)
  }

  selectYes = (): AdditionalConditionsPage => {
    cy.get(this.yesRadioButtonId).click()
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(AdditionalConditionsPage)
  }
}
