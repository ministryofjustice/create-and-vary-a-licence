import Page from './page'
import IndexPage from './index'

export default class ConfirmationPage extends Page {
  private returnHomeButtonId = '[data-qa=return-to-home-page]'

  constructor() {
    super('confirmation-page')
  }

  clickReturnHome = (): IndexPage => {
    cy.get(this.returnHomeButtonId).click()
    return Page.verifyOnPage(IndexPage)
  }
}
