import Page from './page'
import BespokeConditionsQuestionPage from './bespokeConditionsQuestion'
import { Context } from '../support/context'

export default class AdditionalConditionsInputPage extends Page {
  private continueButtonId = '[data-qa=continue]'

  private additionalConditionsToInput = []

  constructor() {
    super('additional-condition-input-page', false)
  }

  withContext = (context: Context): AdditionalConditionsInputPage => {
    this.additionalConditionsToInput = context.additionalConditions
    return this
  }

  enterText = (text: string): AdditionalConditionsInputPage => {
    cy.get('.govuk-form-group > input').type(text)
    return this
  }

  selectRadios = (): AdditionalConditionsInputPage => {
    cy.get('.govuk-radios div:nth-child(1) > input').click({ multiple: true })
    return this
  }

  nextInput = (): AdditionalConditionsInputPage => {
    cy.task('stubPutAdditionalConditionData')
    cy.task('stubGetLicenceWithConditionToComplete', this.additionalConditionsToInput.shift())
    cy.get(this.continueButtonId).click()
    this.checkOnPage()
    this.runAxe()
    return this
  }

  clickContinue = (): BespokeConditionsQuestionPage => {
    cy.task('stubPutAdditionalConditionData')
    cy.task('stubGetLicence')
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(BespokeConditionsQuestionPage)
  }
}
