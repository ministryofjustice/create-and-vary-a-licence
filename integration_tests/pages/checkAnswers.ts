import Page from './page'
import ConfirmationPage from './confirmation'

export default class CheckAnswersPage extends Page {
  private sendLicenceConditionsButtonId = '[data-qa=send-licence-conditions]'

  constructor() {
    super('check-answers-page')
  }

  clickSendLicenceConditionsToPrison = (): ConfirmationPage => {
    cy.get(this.sendLicenceConditionsButtonId).click()
    return Page.verifyOnPage(ConfirmationPage)
  }
}
