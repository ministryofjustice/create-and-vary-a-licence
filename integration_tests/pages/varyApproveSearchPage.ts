import Page from './page'

export default class ApprovalSearchPage extends Page {
  private searchHeading = '#vary-approval-search-heading'

  constructor() {
    super('vary-approval-search-page')
  }

  getSearchHeading = () => {
    return cy.get(this.searchHeading)
  }
}
