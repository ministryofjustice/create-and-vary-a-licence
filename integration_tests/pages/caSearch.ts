import ComDetailsPage from './comDetails'
import Page from './page'
import ViewALicencePage from './viewALicence'
import ViewCasesPage from './viewCasesPage'
import ChangeLocationPage from './changeLocationPage'

export default class CaSearchPage extends Page {
  private searchHeading = '#ca-search-heading'

  private prisonTabTitle = '#tab-heading-prison'

  private probationTabTitle = '#tab-heading-probation'

  private attentionNeededTabTitle = '#tab-heading-attention-needed'

  private probationPractitionerLinkId = '[data-qa=comLink]'

  private licenceLinkId = '#name-button-1'

  private changeLocationsLink = '[data-qa=change-location-link]'

  constructor() {
    super('ca-search-page')
  }

  getSearchHeading = () => {
    return cy.get(this.searchHeading)
  }

  getPrisonTabTitle = () => {
    return cy.get(this.prisonTabTitle)
  }

  getProbationTabTitle = () => {
    return cy.get(this.probationTabTitle)
  }

  getOffenderName = () => {
    return cy.get(this.licenceLinkId)
  }

  getAttentionNeededTabTitle = () => {
    return cy.get(this.attentionNeededTabTitle)
  }

  getRow = (n: number) => {
    return cy.get('tbody tr').eq(n)
  }

  clickOffenderName = (): ViewALicencePage => {
    cy.get(this.licenceLinkId).click()
    return Page.verifyOnPage(ViewALicencePage)
  }

  clickFirstComName = (): ComDetailsPage => {
    cy.task('stubGetStaffDetailsByStaffCode')
    cy.get(this.probationPractitionerLinkId).first().click()
    return Page.verifyOnPage(ComDetailsPage)
  }

  clickBackToCaseload = (): ViewCasesPage => {
    cy.get('.govuk-back-link').click()
    return Page.verifyOnPage(ViewCasesPage)
  }

  clickOnPrisonTab = (): CaSearchPage => {
    cy.get('#tab_people-in-prison').click()
    return Page.verifyOnPage(CaSearchPage)
  }

  clickOnProbationTab = (): CaSearchPage => {
    cy.get('#tab_people-on-probation').click()
    return Page.verifyOnPage(CaSearchPage)
  }

  clickAttentionNeededTab = (): CaSearchPage => {
    cy.get('#tab_attention-needed').click()
    return Page.verifyOnPage(CaSearchPage)
  }

  clickSortByReleaseDate = (): CaSearchPage => {
    cy.get('#release-date-sort').click()
    return Page.verifyOnPage(CaSearchPage)
  }

  getChangeCaseloadOption = () => {
    return cy.get('[data-qa=change-caseload]')
  }

  getCaseloadNames = () => {
    return cy.get('[data-qa=caseload-names]')
  }

  clickChangeLocationsLink = (): ChangeLocationPage => {
    cy.get(this.changeLocationsLink).click()
    return Page.verifyOnPage(ChangeLocationPage)
  }
}
