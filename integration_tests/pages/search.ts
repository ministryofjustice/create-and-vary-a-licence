import CheckAnswersPage from './checkAnswers'
import ComDetailsPage from './comDetails'
import Page from './page'

export default class SearchPage extends Page {
  private licenceLinkId = '#name-button-1'

  private probationPractionerLinkId = '[data-qa=comLink]'

  constructor() {
    super('probation-search-page')
  }

  clickOffenderName = (): CheckAnswersPage => {
    cy.task('stubPutAdditionalConditions')
    cy.task('stubPutAdditionalConditionData')
    cy.task('stubGetLicenceVariationInProgress')
    cy.get(this.licenceLinkId).click()
    return Page.verifyOnPage(CheckAnswersPage)
  }

  clickComName = (): ComDetailsPage => {
    cy.task('stubGetStaffDetailsByStaffCode')
    cy.get(this.probationPractionerLinkId).click()
    return Page.verifyOnPage(ComDetailsPage)
  }
}
