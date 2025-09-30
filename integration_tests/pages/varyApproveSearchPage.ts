import Page from './page'

export default class ApprovalSearchPage extends Page {
  private searchHeading = '#vary-approval-search-heading'

  private pduCasesTabTitle = '#tab-heading-pdu-cases'

  private regionCasesTabTitle = '#tab-heading-region-cases'

  constructor() {
    super('vary-approval-search-page')
  }

  getSearchHeading = () => {
    return cy.get(this.searchHeading)
  }

  getPduCasesTabTitle = () => {
    return cy.get(this.pduCasesTabTitle)
  }

  getRegionCasesTabTitle = () => {
    return cy.get(this.regionCasesTabTitle)
  }
}
