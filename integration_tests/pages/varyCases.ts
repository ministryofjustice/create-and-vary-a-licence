import Page from './page'
import VaryViewActive from './varyViewActive'

export default class VaryCasesPage extends Page {
  private varyLicenceLinkId = '#name-1'

  constructor() {
    super('vary-cases-page')
  }

  selectCase = (): VaryViewActive => {
    cy.get(this.varyLicenceLinkId).click()
    return Page.verifyOnPage(VaryViewActive)
  }
}
