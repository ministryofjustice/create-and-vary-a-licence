import Page from './page'

export default class SearchPage extends Page {
  private searchHeading = '#ca-search-heading'

  constructor() {
    super('ca-search-page')
  }

  getSearchHeading = () => {
    return cy.get(this.searchHeading)
  }
}
