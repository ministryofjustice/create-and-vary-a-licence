import Page from './page'

export default class PrintLicenceHtmlPage extends Page {
  constructor() {
    // No specific page id on printed document so uses the first mandatory section id to verify
    super('supervision', false)
  }

  checkPrintTemplate = (): PrintLicenceHtmlPage => {
    // Verify the structure and key details of the licence document
    cy.get('#title').should('contain', 'Licence for Bob Zimmer')
    cy.get('#offender').should('be.visible').should('contain', '12th February 1980')
    cy.get('#offender-image').should('be.visible')
    cy.get('#objectives').should('be.visible')
    cy.get('#supervision').should('be.visible')
    cy.get('#induction').should('be.visible')
    cy.get('#released-to-other').should('be.visible')
    cy.get('#conditions').should('be.visible')
    cy.get('.condition').should('have.length', 10)
    cy.get('#cancellation').should('be.visible')
    cy.get('#recall').should('be.visible')
    cy.get('#failure-to-comply').should('be.visible')
    cy.get('.boxed .signatures').should('be.visible')
    return this
  }
}
