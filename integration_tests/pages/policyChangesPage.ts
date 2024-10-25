import Page from './page'
import CheckAnswersPage from './checkAnswers'
import AdditionalConditionsInputPage from './additionalConditionInput'
import DeleteConditionPage from './DeleteConditionPage'

export default class PolicyChangesPage extends Page {
  private continueButtonId = '[data-qa=continue]'

  private deleteButtonId = '[data-qa=delete]'

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

  clickDeleteCondition = (): DeleteConditionPage => {
    cy.task('stubPutAdditionalConditions')
    cy.task('stubPutAdditionalConditionData')
    cy.get(this.deleteButtonId).click()
    return Page.verifyOnPage(DeleteConditionPage)
  }

  clickNextChangeNoReplacement = (): DeleteConditionPage => {
    cy.task('stubPutAdditionalConditions')
    cy.task('stubPutAdditionalConditionData')
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(DeleteConditionPage)
  }
}
