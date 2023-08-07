import Page from './page'
import CheckAnswersPage from './checkAnswers'

export default class EditLicenceQuestionPage extends Page {
  private yesRadioButtonId = '[value=Yes]'

  private continueButtonId = '[data-qa=continue]'

  constructor() {
    super('edit-licence-question-page')
  }

  selectYes = (): EditLicenceQuestionPage => {
    cy.get(this.yesRadioButtonId).click()
    return this
  }

  clickContinue = (): CheckAnswersPage => {
    cy.task('stubUpdateLicenceStatus')
    cy.task('stubGetCompletedLicence', { statusCode: 'IN_PROGRESS', typeCode: 'AP_PSS' })
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(CheckAnswersPage)
  }
}
