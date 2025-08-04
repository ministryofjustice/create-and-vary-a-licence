import Page from './page'

export default class ApprovalSearchPage extends Page {
  private searchHeading = '#approval-search-heading'

  private approvalNeededTabTitle = '#tab-heading-approval-needed'

  private recentlyApprovedTabTitle = '#tab-heading-recently-approved'

  constructor() {
    super('approval-search-page')
  }

  getSearchHeading = () => {
    return cy.get(this.searchHeading)
  }

  getApprovalNeededTabTitle = () => {
    return cy.get(this.approvalNeededTabTitle)
  }

  getRecentlyApprovedTabTitle = () => {
    return cy.get(this.recentlyApprovedTabTitle)
  }
}
