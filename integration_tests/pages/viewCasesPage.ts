import Page from './page'
import ViewALicencePage from './viewALicence'
import CaSearchPage from './caSearch'
import ComDetailsPage from './comDetails'
import ChangeLocationPage from './changeLocationPage'
import TimeServedConfirmCreatePage from './timeServedConfirmCreate'

export default class ViewCasesPage extends Page {
  private viewLicenceLinkId = '#name-button-1'

  private changeLocationsLink = '[data-qa=change-location-link]'

  private searchTextInput = '#search'

  private searchButtonId = '[data-qa=search-button]'

  constructor() {
    super('view-cases-page')
  }

  clickSearch = (text: string): CaSearchPage => {
    cy.get(this.searchTextInput).type(text)
    cy.get(this.searchButtonId).click()
    return Page.verifyOnPage(CaSearchPage)
  }

  clickFutureReleasesTab = (): ViewCasesPage => {
    cy.get('#tab_future-releases').click()
    return this
  }

  clickALicence = (): ViewALicencePage => {
    cy.get(this.viewLicenceLinkId).click()
    return Page.verifyOnPage(ViewALicencePage)
  }

  clickATimeServedLicence = (): TimeServedConfirmCreatePage => {
    cy.get(this.viewLicenceLinkId).click()
    return Page.verifyOnPage(TimeServedConfirmCreatePage)
  }

  clickComDetails = (): ComDetailsPage => {
    cy.contains('td a', 'John Smith').click()
    return Page.verifyOnPage(ComDetailsPage)
  }

  clickChangeLocationsLink = (): ChangeLocationPage => {
    cy.get(this.changeLocationsLink).click()
    return Page.verifyOnPage(ChangeLocationPage)
  }

  getCaseloadNames = () => {
    return cy.get('[data-qa=caseload-names]')
  }

  getChangeCaseloadOption = () => {
    return cy.get('[data-qa=change-caseload]')
  }

  getTableRows = () => {
    return cy.get('tbody tr')
  }

  getRow = n => {
    return cy.get('tbody  tr').eq(n)
  }

  getReleaseDateFlag = () => {
    return cy.get('.urgent-highlight-message')
  }

  clickLinkWithDataQa = id => {
    return cy.get(`[data-qa=${id}]`).click()
  }

  checkIfFutureReleasesTabIsActive = () => {
    return cy.get('#tab_future-releases').should('have.attr', 'aria-selected', 'true')
  }
}
