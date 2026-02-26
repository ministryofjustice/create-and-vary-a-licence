import Page from './page'

export default class RestrictedDetailsPage extends Page {
  private restrictionMessage = '#restriction-message'

  constructor() {
    super('restricted-details-page')
  }

  getRestrictedDetails = () => {
    return cy.get(this.restrictionMessage)
  }

  clickBack = <T extends Page>(pageType: new () => T): T => {
    cy.get('.govuk-back-link').click()
    return Page.verifyOnPage(pageType)
  }
}
