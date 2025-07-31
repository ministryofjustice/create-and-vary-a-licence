import Page from './page'

export default class ApprovalSearchPage extends Page {
  private searchHeading = '#approval-search-heading'

  constructor() {
    super('approval-search-page')
  }

  getSearchHeading = () => {
    return cy.get(this.searchHeading)
  }
}
