import Page from './page'
import CheckAnswersPage from './checkAnswers'
import PolicyChangesPage from './policyChangesPage'

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

  clickContinuePolicyChanges = (): PolicyChangesPage => {
    cy.task('stubGetLicenceVariationInProgress', '2.0')
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(PolicyChangesPage)
  }
}
