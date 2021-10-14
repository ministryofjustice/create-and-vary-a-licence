import Page from './page'
import CheckAnswersPage from './checkAnswers'

export default class BespokeConditionsPage extends Page {
  private continueButtonId = '[data-qa=continue]'

  private addAnotherId = '[data-qa=add-another]'

  constructor() {
    super('bespoke-conditions-page')
  }

  enterBespokeCondition = (conditionId: number, condition: string): BespokeConditionsPage => {
    const fieldName = `conditions[${conditionId}]`
    cy.get(`textarea[name="${fieldName}"]`).type(condition)
    return this
  }

  clickAddAnother = (): BespokeConditionsPage => {
    cy.get(this.addAnotherId).click()
    return this
  }

  clickContinue = (): CheckAnswersPage => {
    cy.task('stubPutBespokeConditions')
    cy.task('stubGetCompletedLicence')
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(CheckAnswersPage)
  }
}
