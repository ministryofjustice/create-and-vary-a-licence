import Page from './page'
import CheckAnswersPage from './checkAnswers'

export default class VloDiscussionPage extends Page {
  private yesRadioButtonId = '[value=Yes]'

  private continueButtonId = '[data-qa=continue]'

  constructor() {
    super('vlo-discussion-page')
  }

  selectYes = (): VloDiscussionPage => {
    cy.task('stubUpdateVloDiscussion')
    cy.get(this.yesRadioButtonId).click()
    return this
  }

  clickContinue = (): CheckAnswersPage => {
    cy.task('stubGetLicenceVariationInProgress')
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(CheckAnswersPage)
  }
}
