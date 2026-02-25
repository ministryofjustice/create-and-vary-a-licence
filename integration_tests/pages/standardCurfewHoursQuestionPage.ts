import Page from './page'
import AdditionalConditionsQuestionPage from './additionalConditionsQuestion'
import DoHdcCurfewHoursApplyDailyPage from './doHdcCurfewHoursApplyDailyPage'

export default class StandardCurfewHoursQuestionPage extends Page {
  private yesRadioButtonId = '[value=Yes]'

  private continueButtonId = '[data-qa=continue]'

  constructor() {
    super('standard-curfew-hours-question', false)
  }

  selectYes = (): StandardCurfewHoursQuestionPage => {
    cy.get(this.yesRadioButtonId).click()
    return this
  }

  selectNo = (): StandardCurfewHoursQuestionPage => {
    cy.get('[value=No]').click()
    return this
  }

  clickContinue = (): AdditionalConditionsQuestionPage => {
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(AdditionalConditionsQuestionPage)
  }

  clickContinueToDoHdcCurfewHoursApplyDailyPage = (): DoHdcCurfewHoursApplyDailyPage => {
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(DoHdcCurfewHoursApplyDailyPage)
  }
}
