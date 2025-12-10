import AppointmentContactPage from './appointmentContact'
import Page from './page'
import SelectAddressPage from './selectAddress'

export default class AppointmentPlacePage extends Page {
  private searchQueryId = '#searchQuery'

  private searchAddressesButtonId = '[data-qa=searchAddresses]'

  private useSavedAddress = '[data-qa=use-saved-address]'

  private deleteAddress = '[data-qa^="delete-address-"]'

  private useThisAddressBtn = '[data-qa="useThisAddress"]'

  private errorList = '.govuk-error-summary__list'

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

  useThisAddressBtnClick = (): AppointmentPlacePage => {
    cy.get(this.useThisAddressBtn).click()
    return this
  }

  clickUseThisAddressAndNavigate = (): AppointmentContactPage => {
    cy.get(this.useThisAddressBtn).click()
    return Page.verifyOnPage(AppointmentContactPage)
  }

  selectSavedAddressByIndex = (index: number) => cy.get(`[data-qa="address-${index}"]`).click()

  errorListSummary = () => {
    return cy.get(this.errorList)
  }
}
