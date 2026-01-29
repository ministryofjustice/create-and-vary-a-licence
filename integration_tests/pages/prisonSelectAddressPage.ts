import Page from './page'

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

  addPreferredAddressCheckbox = () => {
    return cy.get(this.isPreferredAddressId)
  }
}
