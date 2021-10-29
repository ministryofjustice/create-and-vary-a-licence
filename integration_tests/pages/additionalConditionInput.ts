import Page from './page'
import BespokeConditionsQuestionPage from './bespokeConditionsQuestion'

export default class AdditionalConditionsInputPage extends Page {
  private continueButtonId = '[data-qa=continue]'

  constructor() {
    super('additional-condition-input-page', false)
  }

  enterData = (text: string): AdditionalConditionsInputPage => {
    cy.get('.govuk-form-group > input').type(text)
    return this
  }

  clickContinue = (): BespokeConditionsQuestionPage => {
    cy.task('stubGetLicence')
    cy.task('stubPutAdditionalConditionData')
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(BespokeConditionsQuestionPage)
  }
}
