import Page from './page'
import VloDiscussionPage from './vloDiscussionPage'

export default class SpoDiscussionPage extends Page {
  private yesRadioButtonId = '[value=Yes]'

  private continueButtonId = '[data-qa=continue]'

  constructor() {
    super('spo-discussion-page')
  }

  selectYes = (): SpoDiscussionPage => {
    cy.task('stubUpdateSpoDiscussion')
    cy.get(this.yesRadioButtonId).click()
    return this
  }

  clickContinue = (): VloDiscussionPage => {
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(VloDiscussionPage)
  }
}
