import Page from './page'
import AdditionalConditionsInputPage from './additionalConditionInput'
import { Context } from '../support/context'
import ExclusionZoneConditionInputPage from './exclusionZoneConditionInput'
import { LicenceKind } from '../../server/enumeration'

export default class AdditionalConditionsPage extends Page {
  private continueButtonId = '[data-qa=continue]'

  private context: Context = { additionalConditions: [] }

  constructor() {
    super('additional-licence-conditions-page')
  }

  getContext = () => {
    return this.context
  }

  selectCondition = (conditionId: string): AdditionalConditionsPage => {
    cy.get(`#${conditionId}`).click()
    this.context.additionalConditions.push(conditionId)
    return this
  }

  clickContinue = (licenceKind: LicenceKind = LicenceKind.CRD): AdditionalConditionsInputPage => {
    cy.task('stubPutAdditionalConditions')
    cy.task('stubPutAdditionalConditionData')
    cy.task('stubGetLicenceWithConditionToComplete', { code: this.context?.additionalConditions.shift(), licenceKind })
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(AdditionalConditionsInputPage)
  }

  clickContinueToMez = (): ExclusionZoneConditionInputPage => {
    cy.task('stubPutAdditionalConditions')
    cy.task('stubPutAdditionalConditionData')
    cy.task('stubGetLicenceWithConditionToComplete', { code: this.context?.additionalConditions.shift() })
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(ExclusionZoneConditionInputPage)
  }
}
