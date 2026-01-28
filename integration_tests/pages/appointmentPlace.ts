import AppointmentContactPage from './appointmentContact'
import Page from './page'
import SelectAddressPage from './selectAddress'
import PrisonSelectAddressPage from './prisonSelectAddressPage'

export default class AppointmentPlacePage extends Page {
  private searchQueryId = '#searchQuery'

  private searchAddressesButtonId = '[data-qa=searchAddresses]'

  private useSavedAddress = '[data-qa=use-saved-address]'

  private addressNotSaved = '[data-qa=address-not-saved]'

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

  findAddressForPrison = (): PrisonSelectAddressPage => {
    cy.get(this.searchAddressesButtonId).click()
    return Page.verifyOnPage(PrisonSelectAddressPage)
  }

  useSavedAddressField = () => {
    return cy.get(this.useSavedAddress)
  }

  getAddressNotSavedMessage = () => cy.get(this.addressNotSaved)

  deleteAddressLink = () => {
    return cy.get(this.deleteAddress)
  }

  deleteAddressLinkByIndex = (index: number) => {
    cy.get(`[data-qa="delete-address-${index}"]`).click()
    return this
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

  getSuccessBanner = () => {
    return cy.get('[class*="moj-banner"][class*="success"]')
  }

  getSuccessBannerText = () => {
    return cy.get('[class*="moj-banner"][class*="success"]').then($banner => {
      return $banner.text()
    })
  }
}
