import Page from './page'

export default class PrintLicenceHtmlPage extends Page {
  constructor() {
    // No specific page id on printed document so uses the first mandatory section id to verify
    super('ap-dates', false)
  }

  checkPrintTemplate = (contactNumber: string, alternativeNumber = null): PrintLicenceHtmlPage => {
    // Verify the structure and key details of the licence document
    cy.get('#title').should('contain', 'Licence and post sentence supervision order for Test Person')
    cy.get('#offender').should('be.visible').should('contain', '12 February 1980')
    cy.get('#offender-image').should('be.visible')
    cy.get('#purposes').should('be.visible')
    cy.get('#ap-dates').should('be.visible')
    cy.get('#pss-dates').should('be.visible')
    cy.get('#induction').should('be.visible')
    cy.get('#ap-conditions').should('be.visible')
    cy.get('#pss-conditions').should('be.visible')
    cy.get('.condition').should('have.length', 16)
    cy.get('#cancellation-ap').should('be.visible')
    cy.get('#cancellation-pss').should('be.visible')
    cy.get('#recall').should('be.visible')
    cy.get('#failure-to-comply-ap').should('be.visible')
    cy.get('#failure-to-comply-pss').should('be.visible')
    cy.get('.boxed .signatures').should('be.visible')

    this.checkContactTelephoneNumber(contactNumber)

    if (alternativeNumber) {
      this.checkAlternativeContactTelephoneNumber(alternativeNumber)
    } else {
      this.checkNoAlternativeContactTelephoneNumber()
    }

    return this
  }

  checkContactTelephoneNumber = expectedNumber => {
    cy.get('[data-qa="appointment-phone-number"]')
      .should('contain', 'Contact telephone number:')
      .within(() => {
        cy.get('span.bold').should('have.text', expectedNumber)
      })
  }

  checkAlternativeContactTelephoneNumber = expectedNumber => {
    if (expectedNumber) {
      cy.get('[data-qa="appointment-alternative-phone-number"]')
        .should('contain', 'Alternative contact phone number:')
        .within(() => {
          cy.get('span.bold').should('have.text', expectedNumber)
        })
    } else {
      cy.get('[data-qa="appointment-alternative-phone-number"]').should('not.exist')
    }
  }

  checkNoAlternativeContactTelephoneNumber = () => {
    // Then
    cy.get('[data-qa="appointment-alternative-phone-number"]').should('not.exist')
  }
}
