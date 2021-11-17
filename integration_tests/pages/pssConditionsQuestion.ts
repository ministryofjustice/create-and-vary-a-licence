import Page from './page'
import PssConditionsPage from './pssConditions'

export default class PssConditionsQuestionPage extends Page {
  private yesRadioButtonId = '[value=yes]'

  private continueButtonId = '[data-qa=continue]'

  constructor() {
    super('additional-pss-conditions-question-page', false)
  }

  selectYes = (): PssConditionsQuestionPage => {
    cy.get(this.yesRadioButtonId).click()
    return this
  }

  clickContinue = (): PssConditionsPage => {
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(PssConditionsPage)
  }
}
