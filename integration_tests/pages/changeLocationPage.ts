import Page from './page'
import ViewCasesPage from './viewCasesPage'

export default class ChangeLocationPage extends Page {
  constructor() {
    super('change-location-page')
  }

  clickContinue = () => {
    return cy.get('[data-qa=continue]').click()
  }

  clickCancel = (): ViewCasesPage => {
    cy.get('[data-qa=cancel]').click()
    return Page.verifyOnPage(ViewCasesPage)
  }

  getErrorSummary = () => {
    return cy.get('.govuk-error-summary__body')
  }

  clickCheckBox = prison => {
    cy.contains(prison).click()
  }
}
