import Page from './page'
import ConfirmVariationPage from './confirmVariationPage'

export default class ViewVariationPage extends Page {
  constructor() {
    super('view-variation-page')
  }

  selectVary = (): ConfirmVariationPage => {
    cy.get('[data-qa=vary-licence]:first').click()
    return Page.verifyOnPage(ConfirmVariationPage)
  }
}
