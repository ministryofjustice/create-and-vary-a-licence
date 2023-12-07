import CheckAnswersPage from './checkAnswers'
import Page from './page'
import PssConditionsPage from './pssConditions'

export default class PssConditionsQuestionPage extends Page {
  private yesRadioButtonId = '[value=Yes]'

  private noRadiobuttonId = '[value=No]'

  private continueButtonId = '[data-qa=continue]'

  constructor() {
    super('additional-pss-conditions-question-page', false)
  }

  selectYes = (): PssConditionsQuestionPage => {
    cy.get(this.yesRadioButtonId).click()
    return this
  }

  selectNo = (): PssConditionsQuestionPage => {
    cy.get(this.noRadiobuttonId).click()
    return this
  }

  clickContinue = (): PssConditionsPage => {
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(PssConditionsPage)
  }

  clickContinueAfterNo = (): CheckAnswersPage => {
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(CheckAnswersPage)
  }
}
