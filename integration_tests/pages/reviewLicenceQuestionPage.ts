import { LicenceKind, LicenceStatus } from '../../server/enumeration'
import Page from './page'
import SpoDiscussionPage from './spoDiscussionPage'

export default class ReviewLicenceQuestionPage extends Page {
  private reviewLicenceId = '[data-qa=review-licence]'

  private radioBtnYes = '#radio-option'

  private radioBtnNo = '#radio-option-2'

  private continueId = '[data-qa=continue]'

  constructor() {
    super('review-licence-question-page')
  }

  selectNoToReviewWithOutVariation = () => {
    cy.task('stubGetCompletedLicence', {
      statusCode: LicenceStatus.ACTIVE,
      kind: LicenceKind.TIME_SERVED,
      isReviewNeeded: false,
      isReviewed: true,
    })
    cy.get(this.radioBtnNo).click()
  }

  selectYesToVary = () => {
    cy.get(this.radioBtnYes).click()
  }

  clickContinue = () => cy.get(this.continueId).click()

  clickContinueToSpoPage = (): SpoDiscussionPage => {
    cy.get(this.continueId).click()
    return Page.verifyOnPage(SpoDiscussionPage)
  }
}
