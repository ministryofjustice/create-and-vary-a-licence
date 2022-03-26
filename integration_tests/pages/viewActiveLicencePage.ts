import Page from './page'
import ConfirmVariationPage from './confirmVariationPage'

export default class ViewActiveLicencePage extends Page {
  constructor() {
    super('view-active-licence-page')
  }

  selectVary = (): ConfirmVariationPage => {
    cy.get('[data-qa=vary-licence]:first').click()
    return Page.verifyOnPage(ConfirmVariationPage)
  }
}
