import Page from './page'
import ViewALicencePage from './viewALicence'
import ComDetailsPage from './comDetails'

export default class ViewCasesPage extends Page {
  private viewLicenceLinkId = '#name-button-1'

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
}
