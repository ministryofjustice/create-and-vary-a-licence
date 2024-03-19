import Page from './page'
import TimelinePage from './timelinePage'

export default class VaryCasesPage extends Page {
  private varyLicenceLinkId = '#name-link-1'

  public myCount = '#my-count'

  constructor() {
    super('vary-cases-page')
  }

  selectCase = (): TimelinePage => {
    cy.get(this.varyLicenceLinkId).click()
    return Page.verifyOnPage(TimelinePage)
  }

  getValue = id => {
    return cy.get(id)
  }
}
