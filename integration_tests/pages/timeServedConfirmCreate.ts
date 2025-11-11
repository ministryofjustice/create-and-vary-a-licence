import Page from './page'

export default class TimeServedConfirmCreatePage extends Page {
  private continueButtonId = '[data-qa=continue]'

  constructor() {
    super('time-served-confirm-create-page')
  }

  selectRadio = (value?: string): TimeServedConfirmCreatePage => {
    cy.get(`input[value="${value}"]`).click()
    return this
  }

  clickContinueButton = (): TimeServedConfirmCreatePage => {
    cy.get(this.continueButtonId).click()
    return this
  }
}
