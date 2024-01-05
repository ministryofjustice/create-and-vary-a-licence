import Page from './page'
import AppointmentContactPage from './appointmentContact'
import ViewALicencePage from './viewALicence'

export default class AppointmentPlacePage extends Page {
  private addressTextInputId = '#addressLine1'

  private addressTownTextInputId = '#addressTown'

  private addressCountyTextInputId = '#addressCounty'

  private addressPostcodeTextInputId = '#addressPostcode'

  private continueButtonId = '[data-qa=continue]'

  constructor() {
    super('appointment-place-page')
  }

  enterAddressLine1 = (text: string): AppointmentPlacePage => {
    cy.get(this.addressTextInputId).type(text)
    return this
  }

  enterTown = (text: string): AppointmentPlacePage => {
    cy.get(this.addressTownTextInputId).type(text)
    return this
  }

  enterCounty = (text: string): AppointmentPlacePage => {
    cy.get(this.addressCountyTextInputId).type(text)
    return this
  }

  enterPostcode = (text: string): AppointmentPlacePage => {
    cy.get(this.addressPostcodeTextInputId).type(text)
    return this
  }

  enterDefaultAddress = (): AppointmentPlacePage => {
    cy.get(this.addressTextInputId).type('123 Fake St')
    cy.get(this.addressTownTextInputId).type('Faketown')
    cy.get(this.addressCountyTextInputId).type('Fakesbury')
    cy.get(this.addressPostcodeTextInputId).type('FA1 1KE')
    return this
  }

  clickContinue = (): AppointmentContactPage => {
    cy.task('stubPutAppointmentAddress')
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(AppointmentContactPage)
  }

  clickContinueToReturn = (): ViewALicencePage => {
    cy.task('stubPutAppointmentAddress')
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(ViewALicencePage)
  }
}
