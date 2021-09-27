import Page from './page'
import CaseloadPage from './caseload'

export default class IndexPage extends Page {
  private createLicenceTileId = '#createLicenceCard'

  constructor() {
    super('index-page')
  }

  clickCreateALicence = (): CaseloadPage => {
    cy.get(this.createLicenceTileId).click()
    return Page.verifyOnPage(CaseloadPage)
  }
}
