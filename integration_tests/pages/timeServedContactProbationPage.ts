import { LicenceKind } from '../../server/enumeration'
import ConfirmationPage from './confirmation'
import Page from './page'

export default class TimeServedContactProbationPage extends Page {
  private timeServedContactProbationPageHeading = '#time-served-contact-probation-page-heading'

  private alreadyContactedRadio = '[data-qa=already-contacted]'

  private communicationMethodEmailCheckbox = '[data-qa=method-email]'

  private continueButtonId = '[data-qa=continue]'

  constructor() {
    super('time-served-contact-probation-page')
  }

  getHeading = () => {
    return cy.get(this.timeServedContactProbationPageHeading)
  }

  selectAlreadyContacted = (): TimeServedContactProbationPage => {
    cy.get(this.alreadyContactedRadio).click()
    return this
  }

  selectCommunicationMethodEmail = (): TimeServedContactProbationPage => {
    cy.get(this.communicationMethodEmailCheckbox).click()
    return this
  }

  clickContinue = (): ConfirmationPage => {
    cy.task('stubGetCompletedLicence', {
      statusCode: 'SUBMITTED',
      typeCode: 'AP',
      kind: LicenceKind.TIME_SERVED,
    })
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(ConfirmationPage)
  }
}
