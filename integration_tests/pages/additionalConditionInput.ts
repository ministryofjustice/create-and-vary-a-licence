import moment from 'moment'
import Page from './page'
import BespokeConditionsQuestionPage from './bespokeConditionsQuestion'
import { Context } from '../support/context'

export default class AdditionalConditionsInputPage extends Page {
  private continueButtonId = '[data-qa=continue]'

  private additionalConditionsToInput = []

  constructor() {
    super('additional-condition-input-page')
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
    cy.get("input[name*='addressCounty']").type('London')
    cy.get("input[name*='addressPostcode']").type('SW2 5XF')
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
    cy.get(this.continueButtonId).click()
    cy.task('stubGetLicenceWithConditionToComplete', this.additionalConditionsToInput.shift())
    cy.reload()
    this.checkOnPage()
    if (runAxe) {
      this.runAxe()
    }
    return this
  }

  clickContinue = (): BespokeConditionsQuestionPage => {
    cy.get(this.continueButtonId).click()
    cy.task('stubGetLicence')
    cy.visit('/licence/create/id/1/bespoke-conditions-question')
    return Page.verifyOnPage(BespokeConditionsQuestionPage)
  }
}
