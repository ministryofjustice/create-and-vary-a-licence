import Page from './page'
import BespokeConditionsQuestionPage from './bespokeConditionsQuestion'

export default class AdditionalConditionsPage extends Page {
  private continueButtonId = '[data-qa=continue]'

  constructor() {
    super('additional-conditions-page', false)
  }

  selectConditions = (conditionIds: string[]): AdditionalConditionsPage => {
    conditionIds.forEach(id => cy.get(`#${id}`).click())
    return this
  }

  clickContinue = (): BespokeConditionsQuestionPage => {
    cy.task('stubPutAdditionalConditions')
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(BespokeConditionsQuestionPage)
  }
}
