import Page from './page'
import ConfirmVariationPage from './confirmVariationPage'

export default class ViewActiveLicencePage extends Page {
  private curfewAddressClass = '.curfew-address-row'

  private allCurfewTimesEqualClass = '.all-curfew-times-equal'

  private firstNightCurfewTimesClass = '.first-night-curfew-times-row'

  private hdcadClass = '.hdcad-row'

  constructor() {
    super('view-active-licence-page')
  }

  selectVary = (): ConfirmVariationPage => {
    cy.get('[data-qa=vary-licence]:first').click()
    return Page.verifyOnPage(ConfirmVariationPage)
  }

  getHdcCurfewDetails = (): Cypress.Chainable<JQuery<HTMLElement>> => {
    return cy.get('[data-qa=hdc-curfew-details]')
  }

  getHdcAdSection = (): Cypress.Chainable<JQuery<HTMLElement>> => {
    return cy.get(this.hdcadClass)
  }

  getCurfewAddressSection = (): Cypress.Chainable<JQuery<HTMLElement>> => {
    return cy.get(this.curfewAddressClass)
  }

  getFirstNightCurfewTimesSection = (): Cypress.Chainable<JQuery<HTMLElement>> => {
    return cy.get(this.firstNightCurfewTimesClass)
  }

  getAllCurfewTimesEqualSection = (): Cypress.Chainable<JQuery<HTMLElement>> => {
    return cy.get(this.allCurfewTimesEqualClass)
  }

  signOut = (): Cypress.Chainable<JQuery> => cy.get('[data-qa=signOut]')
}
