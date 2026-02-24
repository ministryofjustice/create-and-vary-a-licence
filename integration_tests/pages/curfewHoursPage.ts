import Page from './page'
import AdditionalConditionsQuestionPage from './additionalConditionsQuestion'

type CurfewTimeInput = {
  prefix: string
  hour?: string
  minute?: string
  ampm?: string
}

export default class CurfewHoursPage extends Page {
  private continueButtonId = '[data-qa=continue]'

  private readonly startPrefix = '#curfewStart'

  private readonly endPrefix = '#curfewEnd'

  constructor() {
    super('curfew-hours', false)
  }

  enterCurfewTime = ({ prefix, hour, minute, ampm }: CurfewTimeInput): CurfewHoursPage => {
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

  enterCurfewStartTime = ({ hour, minute, ampm }): CurfewHoursPage => {
    return this.enterCurfewTime({ prefix: this.startPrefix, hour, minute, ampm })
  }

  enterCurfewEndTime = ({ hour, minute, ampm }): CurfewHoursPage => {
    return this.enterCurfewTime({ prefix: this.endPrefix, hour, minute, ampm })
  }

  clickContinue = (): AdditionalConditionsQuestionPage => {
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(AdditionalConditionsQuestionPage)
  }

  clickContinueWithError = (): CurfewHoursPage => {
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(CurfewHoursPage)
  }

  assertErrorSummaryMessage = (message: string[]): CurfewHoursPage => {
    message.forEach(errorMessage => {
      cy.get('.govuk-error-summary').should('contain', errorMessage)
    })
    return this
  }
}
