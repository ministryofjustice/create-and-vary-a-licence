import Page from './page'
import ViewALicencePage from './viewALicence'
import ComDetailsPage from './comDetails'

export default class ViewCasesPage extends Page {
  constructor() {
    super('view-cases-page')
  }

  clickALicence = (): ViewALicencePage => {
    cy.contains('td button', 'Bob Zimmer').click()
    return Page.verifyOnPage(ViewALicencePage)
  }

  clickComDetails = (): ComDetailsPage => {
    cy.contains('td a', 'Stephen Mills').click()
    return Page.verifyOnPage(ComDetailsPage)
  }
}
