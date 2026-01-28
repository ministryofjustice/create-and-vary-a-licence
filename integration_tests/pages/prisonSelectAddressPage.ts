import Page from './page'
import AppointmentContactPage from './appointmentContact'
import ViewALicencePage from './viewALicence'

export default class PrisonSelectAddressPage extends Page {
  private continueButtonId = '[data-qa=continue]'

  private isPreferredAddressId = '#isPreferredAddressSelected'

  constructor() {
    super('select-address-prison-page')
  }

  selectAddress = (): PrisonSelectAddressPage => {
    cy.get('[data-qa="address-1"]').click()
    return Page.verifyOnPage(PrisonSelectAddressPage)
  }

  clickContinue = (): AppointmentContactPage => {
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(AppointmentContactPage)
  }

  clickContinueToReturn = (): ViewALicencePage => {
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(ViewALicencePage)
  }

  addPreferredAddressCheckbox = () => {
    return cy.get(this.isPreferredAddressId)
  }
}
