import Page from './page'
import AdditionalConditionsInputPage from './additionalConditionInput'

export default class AdditionalConditionsPage extends Page {
  private continueButtonId = '[data-qa=continue]'

  private selectedCondition: string

  constructor() {
    super('additional-conditions-page', false)
  }

  selectCondition = (conditionId: string): AdditionalConditionsPage => {
    cy.get(`#${conditionId}`).click()
    this.selectedCondition = conditionId
    return this
  }

  clickContinue = (): AdditionalConditionsInputPage => {
    cy.task('stubPutAdditionalConditions')
    cy.task('stubGetLicenceWithConditionToComplete', this.selectedCondition)
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(AdditionalConditionsInputPage)
  }
}
