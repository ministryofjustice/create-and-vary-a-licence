import Page from './page'
import PolicyChangesPage from './policyChangesPage'

export default class DeleteConditionPage extends Page {
  private continueButtonId = '[data-qa=continue]'

  constructor() {
    super('policy-confirm-delete')
  }

  selectRadio = (value: string): DeleteConditionPage => {
    cy.get(`input[value="${value}"]`).click()
    return this
  }

  clickContinue = (): PolicyChangesPage => {
    cy.task('stubPutAdditionalConditions')
    cy.task('stubPutAdditionalConditionData')
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(PolicyChangesPage)
  }
}
