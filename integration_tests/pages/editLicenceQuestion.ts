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

  clickContinue = ({
    appointmentTelephoneNumber = '01234567890',
    appointmentAlternativeTelephoneNumber = '09876543210',
  }: {
    appointmentTelephoneNumber?: string
    appointmentAlternativeTelephoneNumber?: string
  } = {}): CheckAnswersPage => {
    cy.task('stubUpdateLicenceStatus')
    cy.task('stubGetCompletedLicence', {
      statusCode: 'IN_PROGRESS',
      typeCode: 'AP_PSS',
      appointmentTelephoneNumber,
      appointmentAlternativeTelephoneNumber,
    })

    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(CheckAnswersPage)
  }
}
