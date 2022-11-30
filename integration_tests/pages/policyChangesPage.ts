import Page from './page'
import CheckAnswersPage from './checkAnswers'
import AdditionalConditionsInputPage from './additionalConditionInput'

export default class PolicyChangesPage extends Page {
  private continueButtonId = '[data-qa=continue]'

  constructor() {
    super('policy-changes-page')
  }

  clickNextChange = (): PolicyChangesPage => {
    cy.task('stubPutAdditionalConditions')
    cy.task('stubPutAdditionalConditionData')
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(PolicyChangesPage)
  }

  clickNextInput = (runAxe = true): AdditionalConditionsInputPage => {
    cy.task('stubPutAdditionalConditions')
    cy.task('stubPutAdditionalConditionData')
    cy.get(this.continueButtonId).click()
    return new AdditionalConditionsInputPage(runAxe)
  }

  clickContinue = (): CheckAnswersPage => {
    cy.task('stubPutAdditionalConditions')
    cy.task('stubPutAdditionalConditionData')
    cy.task('stubGetLicenceVariationInProgress')
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(CheckAnswersPage)
  }
}
