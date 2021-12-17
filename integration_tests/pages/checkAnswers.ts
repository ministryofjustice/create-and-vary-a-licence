import Page from './page'
import ConfirmationPage from './confirmation'
import EditLicenceQuestionPage from './editLicenceQuestion'

export default class CheckAnswersPage extends Page {
  private sendLicenceConditionsButtonId = '[data-qa=send-licence-conditions]'

  private editLicenceButtonId = '#edit-licence-button'

  constructor() {
    super('check-answers-page')
  }

  clickEditLicence = (): EditLicenceQuestionPage => {
    cy.get(this.editLicenceButtonId).click()
    return Page.verifyOnPage(EditLicenceQuestionPage)
  }

  clickSendLicenceConditionsToPrison = (): ConfirmationPage => {
    cy.task('stubSubmitStatus')
    cy.get(this.sendLicenceConditionsButtonId).click()
    return Page.verifyOnPage(ConfirmationPage)
  }
}
