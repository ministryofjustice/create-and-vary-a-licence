import AppointmentPlacePage from './appointmentPlace'
import Page from './page'
import ViewALicencePage from './viewALicence'

export default class ManualAddressEntryPage extends Page {
  private firstLineTextInputId = '#firstLine'

  private secondLineTextInputId = '#secondLine'

  private townOrCityTextInputId = '#townOrCity'

  private countyTextInputId = '#county'

  private postcodeTextInputId = '#postcode'

  private continueButtonId = '[data-qa=continue]'

  private postcodeLookupSearch = '[data-qa=postcodeLookupSearch]'

  private postcodeError = '#postcode-error'

  constructor() {
    super('manual-address-entry-page')
  }

  enterFirstLine = (text: string): ManualAddressEntryPage => {
    cy.get(this.firstLineTextInputId).clear()
    cy.get(this.firstLineTextInputId).type(text)
    return this
  }

  enterSecondLine = (text: string): ManualAddressEntryPage => {
    cy.get(this.secondLineTextInputId).clear()
    cy.get(this.secondLineTextInputId).type(text)
    return this
  }

  enterTownOrCity = (text: string): ManualAddressEntryPage => {
    cy.get(this.townOrCityTextInputId).clear()
    cy.get(this.townOrCityTextInputId).type(text)
    return this
  }

  enterCounty = (text: string): ManualAddressEntryPage => {
    cy.get(this.countyTextInputId).clear()
    cy.get(this.countyTextInputId).type(text)
    return this
  }

  enterPostcode = (text: string): ManualAddressEntryPage => {
    cy.get(this.postcodeTextInputId).clear()
    cy.get(this.postcodeTextInputId).type(text)
    return this
  }

  enterDefaultAddress = (): ManualAddressEntryPage => {
    cy.get(this.firstLineTextInputId).type('123 Fake St')
    cy.get(this.secondLineTextInputId).type('Apt 4B')
    cy.get(this.townOrCityTextInputId).type('Faketown')
    cy.get(this.countyTextInputId).type('Fakesbury')
    cy.get(this.postcodeTextInputId).type('FA1 1KE')
    return this
  }

  clickContinueToReturn = (): ViewALicencePage => {
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(ViewALicencePage)
  }

  clickContinueForErrorMessage = (): ManualAddressEntryPage => {
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(ManualAddressEntryPage)
  }

  findAnAddressBtnClick = (): AppointmentPlacePage => {
    cy.get(this.postcodeLookupSearch).click()
    return Page.verifyOnPage(AppointmentPlacePage)
  }

  getPostcodeError = () => cy.get(this.postcodeError)
}
