import Page from './page'
import AdditionalConditionsQuestionPage from './additionalConditionsQuestion'
import CheckAnswersPage from './checkAnswers'

type CurfewTimeInput = {
  prefix: string
  hour?: string
  minute?: string
  ampm?: string
}

export default class individualCurfewHoursPage extends Page {
  private continueButtonId = '[data-qa=continue]'

  private readonly startPrefix = '#curfewStart'

  private readonly endPrefix = '#curfewEnd'

  constructor() {
    super('individual-curfew-hours', false)
  }

  enterCurfewTime = ({ prefix, hour, minute, ampm }: CurfewTimeInput): individualCurfewHoursPage => {
    const hourSel = `${prefix}-hour`
    const minSel = `${prefix}-minute`
    const ampmSel = `${prefix}-ampm`

    cy.get(hourSel).clear()
    cy.get(minSel).clear()

    if (ampm?.trim()) {
      cy.get(ampmSel).select(ampm.toLowerCase())
    }

    if (hour && hour.length > 0) {
      cy.get(hourSel).type(hour)
    }
    if (minute && minute.length > 0) {
      cy.get(minSel).type(minute)
    }

    return this
  }

  enterCurfewStartTime = ({ hour, minute, ampm }): individualCurfewHoursPage => {
    return this.enterCurfewTime({ prefix: this.startPrefix, hour, minute, ampm })
  }

  enterCurfewEndTime = ({ hour, minute, ampm }): individualCurfewHoursPage => {
    return this.enterCurfewTime({ prefix: this.endPrefix, hour, minute, ampm })
  }

  clickSave = (): CheckAnswersPage => {
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(CheckAnswersPage)
  }

  clickContinue = (): AdditionalConditionsQuestionPage => {
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(AdditionalConditionsQuestionPage)
  }

  clickContinueWithError = (): individualCurfewHoursPage => {
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(individualCurfewHoursPage)
  }

  assertErrorSummaryMessage = (message: string[]): individualCurfewHoursPage => {
    message.forEach(errorMessage => {
      cy.get('.govuk-error-summary').should('contain', errorMessage)
    })
    return this
  }
}
