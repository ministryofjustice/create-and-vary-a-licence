import Page from './page'
import CurfewHoursPage from './curfewHoursPage'

export default class DoHdcCurfewHoursApplyDailyPage extends Page {
  private yesRadioButtonId = '[value=Yes]'

  private continueButtonId = '[data-qa=continue]'

  constructor() {
    super('do-hdc-curfew-hours-apply-daily', false)
  }

  selectYes = (): DoHdcCurfewHoursApplyDailyPage => {
    cy.get(this.yesRadioButtonId).click()
    return this
  }

  clickContinue = (): CurfewHoursPage => {
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(CurfewHoursPage)
  }

  clickContinueWithError = (): DoHdcCurfewHoursApplyDailyPage => {
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(DoHdcCurfewHoursApplyDailyPage)
  }

  assertErrorSummaryMessage = (message: string): DoHdcCurfewHoursApplyDailyPage => {
    cy.get('.govuk-error-summary').should('contain', message)
    return this
  }
}
