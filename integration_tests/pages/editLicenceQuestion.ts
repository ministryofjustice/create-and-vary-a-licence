import Page from './page'
import CheckAnswersPage from './checkAnswers'

export default class EditLicenceQuestionPage extends Page {
  private yesRadioButtonId = '[value=yes]'

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
    cy.task('stubGetCompletedLicence', 'IN_PROGRESS')
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(CheckAnswersPage)
  }
}
