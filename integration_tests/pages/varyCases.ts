import Page from './page'
import ViewVariation from './viewVariation'

export default class VaryCasesPage extends Page {
  private varyLicenceLinkId = '#name-link-1'

  constructor() {
    super('vary-cases-page')
  }

  selectCase = (): ViewVariation => {
    cy.get(this.varyLicenceLinkId).click()
    return Page.verifyOnPage(ViewVariation)
  }
}
