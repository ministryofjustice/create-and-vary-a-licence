import Page from './page'
import SelectAddressPage from './selectAddress'

export default class AppointmentPlacePage extends Page {
  private searchQueryId = '#searchQuery'

  private searchAddressesButtonId = '[data-qa=searchAddresses]'

  private useSavedAddress = '[data-qa=use-saved-address]'

  private deleteAddress = '[data-qa^="delete-address-"]'

  constructor() {
    super('appointment-place-page')
  }

  enterAddressOrPostcode = (text: string): AppointmentPlacePage => {
    cy.get(this.searchQueryId).type(text)
    return this
  }

  findAddress = (): SelectAddressPage => {
    cy.get(this.searchAddressesButtonId).click()
    return Page.verifyOnPage(SelectAddressPage)
  }

  useSavedAddressField = () => {
    return cy.get(this.useSavedAddress)
  }

  deleteAddressLink = () => {
    return cy.get(this.deleteAddress)
  }
}
