import Page from './page'
import { Context } from '../support/context'
import PssConditionsInputPage from './pssConditionInput'

export default class PssConditionsPage extends Page {
  private continueButtonId = '[data-qa=continue]'

  private context: Context = { additionalConditions: [] }

  constructor() {
    super('additional-pss-conditions-page')
  }

  getContext = () => {
    return this.context
  }

  selectCondition = (conditionId: string): PssConditionsPage => {
    cy.get(`#${conditionId}`).click()
    this.context.additionalConditions.push(conditionId)
    return this
  }

  clickContinue = (): PssConditionsInputPage => {
    cy.task('stubPutAdditionalConditions')
    cy.task('stubGetLicenceWithPssConditionToComplete', this.context?.additionalConditions.shift())
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(PssConditionsInputPage)
  }
}
