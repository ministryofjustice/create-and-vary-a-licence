import Page from './page'
import PssConditionsQuestionPage from './pssConditionsQuestion'
import LicenceKind from '../../server/enumeration/LicenceKind'

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

  checkDeleteThisCondition = (): BespokeConditionsPage => {
    cy.get('.delete-condition-button-pluralisable').should('contain.text', 'Delete this condition')
    return this
  }

  checkDeleteTheseConditions = (): BespokeConditionsPage => {
    cy.get('.delete-condition-button-pluralisable').should('contain.text', 'Delete these conditions')
    return this
  }

  clickContinue = (licenceKind: LicenceKind = LicenceKind.PRRD): PssConditionsQuestionPage => {
    cy.task('stubPutBespokeConditions')
    cy.task('stubGetLicence', { licenceKind })
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(PssConditionsQuestionPage)
  }
}
