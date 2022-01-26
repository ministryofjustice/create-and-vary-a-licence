import Page from './page'
import ViewALicencePage from './viewALicence'
import ComDetailsPage from './comDetails'

export default class ViewCasesPage extends Page {
  constructor() {
    super('view-cases-page')
  }

  clickALicence = (): ViewALicencePage => {
    cy.contains('td a', 'Bob Zimmer').click()
    return Page.verifyOnPage(ViewALicencePage)
  }

  clickComDetails = (): ComDetailsPage => {
    cy.contains('td a', 'John Smith').click()
    return Page.verifyOnPage(ComDetailsPage)
  }
}
