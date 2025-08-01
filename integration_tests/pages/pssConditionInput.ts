import moment from 'moment'
import Page from './page'
import { Context } from '../support/context'
import CheckAnswersPage from './checkAnswers'
import { ElectronicMonitoringProvider } from '../../server/@types/licenceApiClientTypes'
import LicenceKind from '../../server/enumeration/LicenceKind'

export default class PssConditionsInputPage extends Page {
  private continueButtonId = '[data-qa=continue]'

  private additionalConditionsToInput = []

  constructor() {
    super('additional-condition-input-page')
  }

  withContext = (context: Context): PssConditionsInputPage => {
    this.additionalConditionsToInput = context.additionalConditions
    return this
  }

  enterTime = (hour = '11', minute = '30', fieldId?: string): PssConditionsInputPage => {
    if (fieldId) {
      cy.get(`#${fieldId}-hour`).type(hour)
      cy.get(`#${fieldId}-minute`).type(minute)
      cy.get(`#${fieldId}-ampm`).select('am')
    } else {
      cy.get("input[name*='hour']").type(hour)
      cy.get("input[name*='minute']").type(minute)
      cy.get("select[name*='ampm']").select('am')
    }
    return this
  }

  enterDate = (): PssConditionsInputPage => {
    cy.get("input[name*='day']").type('11')
    cy.get("input[name*='month']").type('12')
    cy.get("input[name*='year']").type(moment().add(1, 'year').format('YYYY'))
    return this
  }

  enterAddress = (): PssConditionsInputPage => {
    cy.get("input[name*='addressLine1']").type('123 Fake Street')
    cy.get("input[name*='addressTown']").type('Fakestown')
    cy.get("input[name*='addressCounty']").type('Fakeshire')
    cy.get("input[name*='addressPostcode']").type('FA1 1KE')
    return this
  }

  nextInput = (runAxe = true): PssConditionsInputPage => {
    cy.task('stubPutAdditionalConditionData')
    cy.task('stubGetLicenceWithPssConditionToComplete', this.additionalConditionsToInput.shift())
    cy.get(this.continueButtonId).click()
    this.checkOnPage()
    if (runAxe) {
      this.runAxe()
    }
    return this
  }

  clickContinue = (
    electronicMonitoringProvider?: ElectronicMonitoringProvider,
    electronicMonitoringProviderStatus?: 'NOT_NEEDED' | 'NOT_STARTED' | 'COMPLETE',
    licenceKind: LicenceKind = LicenceKind.CRD,
  ): CheckAnswersPage => {
    cy.task('stubPutAdditionalConditionData')
    cy.task('stubGetCompletedLicence', {
      statusCode: 'IN_PROGRESS',
      typeCode: 'AP_PSS',
      kind: licenceKind,
      electronicMonitoringProvider,
      electronicMonitoringProviderStatus,
    })
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(CheckAnswersPage)
  }
}
