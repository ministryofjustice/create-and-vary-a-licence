import Page from './page'
import ConfirmationPage from './confirmation'
import EditLicenceQuestionPage from './editLicenceQuestion'
import ReasonForVariationPage from './reasonForVariationPage'
import DiscardPage from './discardPage'
import CaseloadPage from './caseload'
import AppointmentContactPage from './appointmentContact'

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

  clickSubmitLicenceWithErrors = (): CheckAnswersPage => {
    cy.get(this.sendLicenceConditionsButtonId).click()
    return Page.verifyOnPage(CheckAnswersPage)
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

  getErrorSummary = () => {
    return cy.get('.govuk-error-summary__body')
  }

  dateTimeField = () => {
    return cy.get('.govuk-summary-list__key')
  }

  checkIfElectronicMonitoringProviderExists = () => {
    cy.get('#electronicMonitoringProvider-isToBeTaggedForProgramme').should('exist')
    return this
  }

  checkIfElectronicMonitoringProviderDoesNotExist = () => {
    cy.get('#electronicMonitoringProvider-isToBeTaggedForProgramme').should('not.exist')
    return this
  }

  checkIfChangeLinkVisible = (code: string) => {
    cy.get(`[data-qa="condition-action-${code}"]`).should('contain.text', 'Change')
    return this
  }

  checkIfDeleteLinkVisible = (code: string) => {
    cy.get(`[data-qa="condition-action-${code}"]`).should('contain.text', 'Delete')
    return this
  }

  clickChangeTelephoneLink = (): AppointmentContactPage => {
    cy.get('[data-qa=telephone-change-link]').click()
    return Page.verifyOnPage(AppointmentContactPage)
  }

  clickChangeAlternativeTelephoneLink = (): AppointmentContactPage => {
    cy.get('[data-qa=alternative-telephone-change-link]').click()
    return Page.verifyOnPage(AppointmentContactPage)
  }

  checkAlternativeTelephoneNotEntered() {
    cy.get('.govuk-summary-list__row')
      .contains('dt.govuk-summary-list__key', 'Alternative contact phone number')
      .siblings('dd.govuk-summary-list__value')
      .should('contain.text', 'Not entered')
  }

  checkTelephoneNotEntered() {
    cy.get('.govuk-summary-list__row')
      .contains('dt.govuk-summary-list__key', 'Contact phone number')
      .siblings('dd.govuk-summary-list__value')
      .should('contain.text', 'Not yet entered')
  }

  checkAlternativeTelephoneLinkDoesNotExist() {
    cy.get('[data-qa=alternative-telephone-change-link]').should('not.exist')
  }
}
