import Page from './page'
import ViewVariationPage from './viewVariationPage'

export default class VaryCasesPage extends Page {
  private varyLicenceLinkId = '#name-link-1'

  constructor() {
    super('vary-cases-page')
  }

  selectCase = (): ViewVariationPage => {
    cy.get(this.varyLicenceLinkId).click()
    return Page.verifyOnPage(ViewVariationPage)
  }
}
