import Page from './page'
import ViewALicencePage from './viewALicence'
import ComDetailsPage from './comDetails'
import ChangeLocationPage from './changeLocationPage'

export default class ViewCasesPage extends Page {
  private viewLicenceLinkId = '#name-button-1'

  private changeLocationsLink = '[data-qa=change-location-link]'

  constructor() {
    super('view-cases-page')
  }

  clickALicence = (): ViewALicencePage => {
    cy.get(this.viewLicenceLinkId).click()
    return Page.verifyOnPage(ViewALicencePage)
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
}
