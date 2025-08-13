import Page from './page'
import AppointmentContactPage from './appointmentContact'
import ViewALicencePage from './viewALicence'

export default class SelectAddressPage extends Page {
  private continueButtonId = '[data-qa=continue]'

  private isPreferredAddressId = '#isPreferredAddressSelected'

  constructor() {
    super('select-address-page')
  }

  selectAddress = (): SelectAddressPage => {
    cy.get('[data-qa="address-1"]').click()
    return Page.verifyOnPage(SelectAddressPage)
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
