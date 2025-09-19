import { AdditionalCondition } from '../../server/@types/licenceApiClientTypes'
import AdditionalConditionsInputPage from './additionalConditionInput'
import BespokeConditionsQuestionPage from './bespokeConditionsQuestion'
import Page from './page'

export default class ExclusionZoneConditionInputPage extends AdditionalConditionsInputPage {
  private deleteLink = '[data-qa=delete-map-1-link]'

  private yesRadioButtonId = '[value=Yes]'

  private noRadioButtonId = '[value=No]'

  private deleteButtonId = '[data-qa=delete]'

  enterText = (text: string, fieldName?: string): ExclusionZoneConditionInputPage => {
    if (fieldName) {
      cy.get(`input[name="${fieldName}"]`).type(text)
    } else {
      cy.get('.govuk-form-group > input').type(text)
    }
    return this
  }

  uploadFile = (): ExclusionZoneConditionInputPage => {
    cy.get('input[type=file]').selectFile('cypress/fixtures/test_map.pdf')
    return this
  }

  selectYes = (): ExclusionZoneConditionInputPage => {
    cy.get(this.yesRadioButtonId).click()
    return this
  }

  selectNo = (): ExclusionZoneConditionInputPage => {
    cy.get(this.noRadioButtonId).click()
    return this
  }

  clickDeleteLink = (): ExclusionZoneConditionInputPage => {
    cy.task('stubDeleteAdditionalConditionById')
    cy.get(this.deleteLink).click()
    return this
  }

  clickContinue = (): BespokeConditionsQuestionPage => {
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(BespokeConditionsQuestionPage)
  }

  clickContinueCallbackLoop = (): ExclusionZoneConditionInputPage => {
    cy.get(this.continueButtonId).click()
    return this
  }

  clickContinueForMez = (conditions: AdditionalCondition[]): ExclusionZoneConditionInputPage => {
    cy.task('stubGetCompletedLicence', {
      statusCode: 'IN_PROGRESS',
      typeCode: 'AP_PSS',
      isInHardStopPeriod: false,
      kind: 'CRD',
      conditions,
      appointmentTelephoneNumber: '01234567890',
      appointmentAlternativeTelephoneNumber: '09876543210',
    })
    cy.get(this.continueButtonId).click()
    return this
  }

  clickDeleteCondition = (): BespokeConditionsQuestionPage => {
    cy.task('stubDeleteAdditionalConditionsByCode')
    cy.get(this.deleteButtonId).click()
    return Page.verifyOnPage(BespokeConditionsQuestionPage)
  }
}
