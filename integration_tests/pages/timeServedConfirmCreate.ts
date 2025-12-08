import Page from './page'
import ViewCasesPage from './viewCasesPage'
import AppointmentPersonPage from './appointmentPerson'

export default class TimeServedConfirmCreatePage extends Page {
  private continueButtonId = '[data-qa=continue]'

  constructor() {
    super('time-served-confirm-create-page')
  }

  selectRadio = (value?: string): TimeServedConfirmCreatePage => {
    if (value === 'Yes') {
      cy.task('stubGetPrisonOmuCaseload', {
        licenceId: 1,
        licenceStatus: 'IN_PROGRESS',
        tabType: 'RELEASES_IN_NEXT_TWO_WORKING_DAYS',
        kind: 'TIME_SERVED',
        hasNomisLicence: false,
      })
    } else {
      cy.task('stubGetPrisonOmuCaseload', {
        licenceId: null,
        licenceStatus: 'TIMED_OUT',
        tabType: 'RELEASES_IN_NEXT_TWO_WORKING_DAYS',
        kind: 'TIME_SERVED',
        hasNomisLicence: true,
      })
    }
    cy.get(`input[value="${value}"]`).click()
    return this
  }

  clickContinue = (): AppointmentPersonPage => {
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(AppointmentPersonPage)
  }

  clickContinueButtonToReturn = (): ViewCasesPage => {
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(ViewCasesPage)
  }

  clickContinueButtonToError = () => {
    cy.get(this.continueButtonId).click()
  }

  getErrorMessage = () => {
    return cy.get('.govuk-error-message')
  }

  enterNoReasonText = (text: string): TimeServedConfirmCreatePage => {
    cy.get('#reasonForUsingNomis').clear()
    cy.get('#reasonForUsingNomis').type(text)
    return this
  }

  getNoReasonText = () => {
    return cy.get('#reasonForUsingNomis')
  }

  getRadioCreateOnNomisSelection = () => {
    return cy.get('#create-on-nomis')
  }
}
