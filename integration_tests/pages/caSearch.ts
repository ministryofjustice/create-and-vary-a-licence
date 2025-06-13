import Page from './page'

export default class SearchPage extends Page {
  private searchHeading = '#ca-search-heading'

  private prisonTabTitle = '#tab-heading-prison'

  private probationTabTitle = '#tab-heading-probation'

  constructor() {
    super('ca-search-page')
  }

  getSearchHeading = () => {
    return cy.get(this.searchHeading)
  }

  getPrisonTabTitle = () => {
    return cy.get(this.prisonTabTitle)
  }

  getProbationTabTitle = () => {
    return cy.get(this.probationTabTitle)
  }
}
