import Page from './page'
import SelectAddressPage from './selectAddress'

export default class AppointmentPlacePage extends Page {
  private searchQueryId = '#searchQuery'

  private searchAddressesButtonId = '[data-qa=searchAddresses]'

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
}
