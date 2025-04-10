import type { RuleObject } from 'axe-core'

export default abstract class Page {
  static verifyOnPage<T>(constructor: new () => T): T {
    return new constructor()
  }

  protected constructor(
    private readonly pageId: string,
    private readonly axeTest = true,
    private readonly rules: RuleObject = {},
  ) {
    this.checkOnPage()
    if (axeTest) {
      this.runAxe()
    }
  }

  checkOnPage = (): void => {
    cy.get(`#${this.pageId}`).should('exist')
  }

  runAxe = (): void => {
    cy.injectAxe()
    cy.checkA11y(null, { rules: this.rules })
  }

  fallbackHeaderUserName = (): Cypress.Chainable<JQuery> => cy.get('[data-qa=header-user-name]')

  commonComponentsHeader = (): Cypress.Chainable<JQuery> => cy.get('h1').contains('Common Components Header')

  commonComponentsFooter = (): Cypress.Chainable<JQuery> => cy.get('h1').contains('Common Components Footer')

  signOut = (): Cypress.Chainable<JQuery> => cy.get('[data-qa=signOut]')
}
