import CheckAnswersPage from './checkAnswers'
import ComDetailsPage from './comDetails'
import RestrictedDetailsPage from './restrictedDetails'
import Page from './page'

export default class SearchPage extends Page {
  private licenceLinkId = '#name-button-1'

  private prisonTabTitle = '#tab_people-in-prison'

  private probationTabTitle = '#tab_people-on-probation'

  private probationPractitionerLinkId = '[data-qa=comLink]'

  private searchInputId = '#search'

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

  clickLaoOffenderName = (): RestrictedDetailsPage => {
    cy.get(this.licenceLinkId).click()
    return Page.verifyOnPage(RestrictedDetailsPage)
  }

  clickComName = (): ComDetailsPage => {
    cy.task('stubGetStaffDetailsByStaffCode')
    cy.get(this.probationPractitionerLinkId).click()
    return Page.verifyOnPage(ComDetailsPage)
  }

  getRow = (row: number) => {
    return cy.get('tbody tr').eq(row)
  }

  getPrisonTabTitle = () => {
    return cy.get(this.prisonTabTitle)
  }

  getProbationTabTitle = () => {
    return cy.get(this.probationTabTitle)
  }

  clickOnProbationTab = (): SearchPage => {
    cy.get(this.probationTabTitle).click()
    return Page.verifyOnPage(SearchPage)
  }

  getSearchInput = () => {
    return cy.get(this.searchInputId)
  }
}
