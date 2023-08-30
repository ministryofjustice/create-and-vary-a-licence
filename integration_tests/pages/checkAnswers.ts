import Page from './page'
import ConfirmationPage from './confirmation'
import EditLicenceQuestionPage from './editLicenceQuestion'
import ReasonForVariationPage from './reasonForVariationPage'
import DiscardPage from './discardPage'
import CaseloadPage from './caseload'

export default class CheckAnswersPage extends Page {
  private sendLicenceConditionsButtonId = '[data-qa=send-licence-conditions]'

  private discardButtonId = '[data-qa=discard]'

  private addNotesButtonId = '[data-qa=add-notes]'

  private editLicenceButtonId = '#edit-licence-button'

  private backToCaseloadLinkId = '[data-qa=back-to-caseload-link]'

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

  clickAddVariationNotes = (): ReasonForVariationPage => {
    cy.task('stubGetLicenceVariationInProgress')
    cy.get(this.addNotesButtonId).click()
    return Page.verifyOnPage(ReasonForVariationPage)
  }

  clickDiscard = (): DiscardPage => {
    cy.get(this.discardButtonId).click()
    return Page.verifyOnPage(DiscardPage)
  }

  clickBackToCaseload = (): CaseloadPage => {
    cy.get(this.backToCaseloadLinkId).click()
    return Page.verifyOnPage(CaseloadPage)
  }
}
