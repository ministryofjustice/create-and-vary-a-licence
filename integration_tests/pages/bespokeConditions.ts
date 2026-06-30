import Page from './page'
import LicenceKind from '../../server/enumeration/LicenceKind'
import CheckAnswersPage from './checkAnswers'
import { AdditionalCondition, ElectronicMonitoringProvider } from '../../server/@types/licenceApiClientTypes'
import PssConditionsQuestionPage from './pssConditionsQuestion'

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

  clickContinue = (conditions?: AdditionalCondition[]): CheckAnswersPage => {
    cy.task('stubPutBespokeConditions')
    cy.task('stubGetCompletedLicence', {
      statusCode: 'IN_PROGRESS',
      typeCode: 'AP',
      kind: LicenceKind.CRD,
      appointmentTelephoneNumber: '01234567890',
      appointmentAlternativeTelephoneNumber: '09876543210',
      conditions,
    })

    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(CheckAnswersPage)
  }

  clickContinueEM = (
    conditions?: AdditionalCondition[],
    electronicMonitoringProvider?: ElectronicMonitoringProvider,
    electronicMonitoringProviderStatus?: 'NOT_NEEDED' | 'NOT_STARTED' | 'COMPLETE',
    licenceKind: LicenceKind = LicenceKind.CRD,
  ): CheckAnswersPage => {
    cy.task('stubPutAdditionalConditionData')
    cy.task('stubPutBespokeConditions')
    // cy.task('stubGetLicence', { licenceKind })
    cy.task('stubGetCompletedLicence', {
      statusCode: 'IN_PROGRESS',
      typeCode: 'AP', // cy.task('stubGetCompletedLicence', {
      //   statusCode: 'IN_PROGRESS',
      //   typeCode: 'AP',
      //   kind: licenceKind,
      //   electronicMonitoringProvider,
      //   electronicMonitoringProviderStatus,
      //   conditions,
      //   appointmentTelephoneNumber: '01234567890',
      //   appointmentAlternativeTelephoneNumber: '09876543210',
      // })
      kind: licenceKind,
      electronicMonitoringProvider,
      electronicMonitoringProviderStatus,
      conditions,
      appointmentTelephoneNumber: '01234567890',
      appointmentAlternativeTelephoneNumber: '09876543210',
    })
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(CheckAnswersPage)
  }

  clickContinueGet = (licenceKind: LicenceKind = LicenceKind.PRRD): PssConditionsQuestionPage => {
    cy.task('stubPutBespokeConditions')
    cy.task('stubGetLicence', { licenceKind })
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(PssConditionsQuestionPage)
  }
}
