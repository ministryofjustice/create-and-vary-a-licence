import Page from './page'
import AppointmentContactPage from './appointmentContact'

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
    cy.get(this.addressTextInputId).clear().type(text)
    return this
  }

  enterTown = (text: string): AppointmentPlacePage => {
    cy.get(this.addressTownTextInputId).clear().type(text)
    return this
  }

  enterCounty = (text: string): AppointmentPlacePage => {
    cy.get(this.addressCountyTextInputId).clear().type(text)
    return this
  }

  enterPostcode = (text: string): AppointmentPlacePage => {
    cy.get(this.addressPostcodeTextInputId).clear().type(text)
    return this
  }

  clickContinue = (): AppointmentContactPage => {
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(AppointmentContactPage)
  }
}
