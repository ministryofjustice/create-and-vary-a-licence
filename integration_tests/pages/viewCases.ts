import Page from './page'
import ViewALicencePage from './viewALicence'

export default class ViewCasesPage extends Page {
  constructor() {
    super('view-cases-page')
  }

  clickALicence = (): ViewALicencePage => {
    cy.contains('td button', 'Bob Zimmer').click()
    return Page.verifyOnPage(ViewALicencePage)
  }
}
