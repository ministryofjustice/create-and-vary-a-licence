import Page from './page'
import AdditionalConditionsInputPage from './additionalConditionInput'
import { Context } from '../support/context'

export default class AdditionalConditionsPage extends Page {
  private continueButtonId = '[data-qa=continue]'

  private context: Context = { additionalConditions: [] }

  constructor() {
    super('additional-licence-conditions-page')
  }

  getContext = () => {
    return this.context
  }

  selectCondition = (conditionId: string): AdditionalConditionsPage => {
    cy.get(`#${conditionId}`).click()
    this.context.additionalConditions.push(conditionId)
    return this
  }

  clickContinue = (): AdditionalConditionsInputPage => {
    cy.task('stubPutAdditionalConditions')
    cy.task('stubGetLicenceWithConditionToComplete', this.context?.additionalConditions.shift())
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(AdditionalConditionsInputPage)
  }
}
