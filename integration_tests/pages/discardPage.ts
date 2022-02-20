import Page from './page'
import VaryCasesPage from './varyCases'

export default class DiscardPage extends Page {
  private yesRadioButtonId = '[value=Yes]'

  private continueButtonId = '[data-qa=continue]'

  constructor() {
    super('discard-page')
  }

  selectYes = (): DiscardPage => {
    cy.task('stubDiscardLicence')
    cy.get(this.yesRadioButtonId).click()
    return this
  }

  clickContinue = (): VaryCasesPage => {
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(VaryCasesPage)
  }
}
