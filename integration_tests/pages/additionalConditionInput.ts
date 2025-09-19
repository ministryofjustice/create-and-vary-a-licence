import moment from 'moment'
import Page from './page'
import BespokeConditionsQuestionPage from './bespokeConditionsQuestion'
import { Context } from '../support/context'
import CheckAnswersPage from './checkAnswers'
import PolicyChangesPage from './policyChangesPage'
import PathfinderDetailsQuestionPage from './PathfinderDetailsQuestionPage'
import LicenceKind from '../../server/enumeration/LicenceKind'

export default class AdditionalConditionsInputPage extends Page {
  protected continueButtonId = '[data-qa=continue]'

  private skipButtonId = '[data-qa=skip]'

  private additionalConditionsToInput = []

  constructor(runAxe = true) {
    super('additional-condition-input-page', runAxe)
  }

  withContext = (context: Context): AdditionalConditionsInputPage => {
    this.additionalConditionsToInput = context.additionalConditions
    return this
  }

  selectOption = (text: string, fieldName?: string): AdditionalConditionsInputPage => {
    if (fieldName) {
      cy.get(`select[name="${fieldName}"]`).type(text)
    } else {
      cy.get('.govuk-form-group > select').select(text)
    }
    return this
  }

  enterText = (text: string, fieldName?: string): AdditionalConditionsInputPage => {
    if (fieldName) {
      cy.get(`input[name="${fieldName}"]`).type(text)
    } else {
      cy.get('.govuk-form-group > input').type(text)
    }
    return this
  }

  selectRadio = (value?: string): AdditionalConditionsInputPage => {
    if (value) {
      cy.get(`input[value="${value}"]`).click()
    } else {
      cy.get(`.govuk-radios div:nth-child(1) > input`).click({ multiple: true })
    }
    return this
  }

  enterTime = (hour = '11', minute = '30', fieldId?: string): AdditionalConditionsInputPage => {
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

  enterDate = (): AdditionalConditionsInputPage => {
    cy.get("input[name*='day']").type('11')
    cy.get("input[name*='month']").type('12')
    cy.get("input[name*='year']").type(moment().add(1, 'year').format('YYYY'))
    return this
  }

  enterAddress = (): AdditionalConditionsInputPage => {
    cy.get("input[name*='addressLine1']").type('123 Fake Street')
    cy.get("input[name*='addressTown']").type('Fakestown')
    cy.get("input[name*='addressCounty']").type('Fakeshire')
    cy.get("input[name*='addressPostcode']").type('FA1 1KE')
    return this
  }

  checkBoxes = (): AdditionalConditionsInputPage => {
    cy.get('.govuk-checkboxes__input').click({ multiple: true })
    return this
  }

  clickAddAnother = (): AdditionalConditionsInputPage => {
    cy.get('.moj-add-another__add-button ').click()
    return this
  }

  nextCondition = (runAxe = true): AdditionalConditionsInputPage => {
    cy.task('stubGetLicenceWithConditionToComplete', { code: this.additionalConditionsToInput.shift() })
    cy.get(this.continueButtonId).click()
    cy.reload()
    this.checkOnPage()
    if (runAxe) {
      this.runAxe()
    }
    return this
  }

  clickContinue = (licenceKind: LicenceKind = LicenceKind.PRRD): BespokeConditionsQuestionPage => {
    cy.get(this.continueButtonId).click()
    cy.task('stubGetLicence', { licenceKind })
    cy.visit('/licence/create/id/1/bespoke-conditions-question')
    return Page.verifyOnPage(BespokeConditionsQuestionPage)
  }

  navigateToPathfinder = (): PathfinderDetailsQuestionPage => {
    cy.task('stubGetLicence', { electronicMonitoringProviderStatus: 'NOT_STARTED' })
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(PathfinderDetailsQuestionPage)
  }

  clickSkip = (): BespokeConditionsQuestionPage => {
    cy.task('stubGetLicenceWithConditionToComplete', { code: this.additionalConditionsToInput.shift() })
    cy.get(this.skipButtonId).click()
    cy.visit('/licence/create/id/1/bespoke-conditions-question')
    return Page.verifyOnPage(BespokeConditionsQuestionPage)
  }

  clickNextChange = (): PolicyChangesPage => {
    cy.task('stubPutAdditionalConditions')
    cy.task('stubPutAdditionalConditionData')
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(PolicyChangesPage)
  }

  clickContinueFromVary = (): CheckAnswersPage => {
    cy.task('stubPutAdditionalConditions')
    cy.task('stubPutAdditionalConditionData')
    cy.task('stubGetLicenceVariationInProgress')
    this.checkOnPage()
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(CheckAnswersPage)
  }

  addOneCurfew = (numberOfCurfews: number): AdditionalConditionsInputPage => {
    const parentSelector = `#conditional-numberOfCurfews${numberOfCurfews === 1 ? '' : `-${numberOfCurfews}`}`

    cy.get(parentSelector).find(`#oneCurfewStart-hour`).type('7')
    cy.get(parentSelector).find(`#oneCurfewStart-minute`).type('30')
    cy.get(parentSelector).find(`#oneCurfewStart-ampm`).select('am')

    cy.get(parentSelector).find(`#oneCurfewEnd-hour`).type('8')
    cy.get(parentSelector).find(`#oneCurfewEnd-minute`).type('30')
    cy.get(parentSelector).find(`#oneCurfewEnd-ampm`).select('am')

    return this
  }

  addTwoCurfews = (numberOfCurfews: number): AdditionalConditionsInputPage => {
    const parentSelector = `#conditional-numberOfCurfews${numberOfCurfews === 1 ? '' : `-${numberOfCurfews}`}`

    cy.get(parentSelector).find(`#twoCurfewStart-hour`).type('7')
    cy.get(parentSelector).find(`#twoCurfewStart-minute`).type('30')
    cy.get(parentSelector).find(`#twoCurfewStart-ampm`).select('am')

    cy.get(parentSelector).find(`#twoCurfewEnd-hour`).type('8')
    cy.get(parentSelector).find(`#twoCurfewEnd-minute`).type('30')
    cy.get(parentSelector).find(`#twoCurfewEnd-ampm`).select('am')

    cy.get(parentSelector).find(`#twoCurfewStart2-hour`).type('5')
    cy.get(parentSelector).find(`#twoCurfewStart2-minute`).type('30')
    cy.get(parentSelector).find(`#twoCurfewStart2-ampm`).select('pm')

    cy.get(parentSelector).find(`#twoCurfewEnd2-hour`).type('6')
    cy.get(parentSelector).find(`#twoCurfewEnd2-minute`).type('30')
    cy.get(parentSelector).find(`#twoCurfewEnd2-ampm`).select('pm')

    return this
  }
}
