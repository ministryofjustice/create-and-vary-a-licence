import ComDetailsPage from './comDetails'
import Page from './page'
import ViewALicencePage from './viewALicence'
import ViewCasesPage from './viewCasesPage'

export default class CaSearchPage extends Page {
  private searchHeading = '#ca-search-heading'

  private prisonTabTitle = '#tab-heading-prison'

  private probationTabTitle = '#tab-heading-probation'

  private probationPractionerLinkId = '[data-qa=comLink]'

  private licenceLinkId = '#name-button-1'

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

  clickOffenderName = (): ViewALicencePage => {
    cy.get(this.licenceLinkId).click()
    return Page.verifyOnPage(ViewALicencePage)
  }

  clickComName = (): ComDetailsPage => {
    cy.task('stubGetStaffDetailsByStaffCode')
    cy.get(this.probationPractionerLinkId).click()
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
}
