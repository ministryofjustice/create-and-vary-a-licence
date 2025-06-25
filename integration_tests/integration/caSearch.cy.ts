import Page from '../pages/page'
import IndexPage from '../pages'

context('Search for a person', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubPrisonSignIn')
    cy.task('stubGetPrisonUserDetails')
    cy.task('stubGetPrisonUserCaseloads', {
      details: [
        {
          caseLoadId: 'LEI',
          caseloadFunction: 'GENERAL',
          currentlyActive: true,
          description: 'Leeds (HMP)',
          type: 'INST',
        },
      ],
    })
    cy.task('stubGetPrisonOmuCaseload')
    cy.task('stubGetProbationOmuCaseload')
    cy.task('stubGetPrisons')
    cy.task('stubFeComponents')
    cy.task('stubGetCaSearchResults')
    cy.task('stubGetCompletedLicence', { statusCode: 'APPROVED', typeCode: 'AP_PSS' })
    cy.task('stubRecordAuditEvent')
    cy.signIn()
  })

  it('should click through the ca search journey', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    const caseloadPage = indexPage.clickViewAndPrintALicence()
    let searchPage = caseloadPage.clickSearch('test')
    searchPage.getSearchHeading().contains('Search results for test')
    searchPage.getPrisonTabTitle().contains('People in prison (1 result)')
    searchPage.clickOnProbationTab()
    searchPage.getProbationTabTitle().contains('People on probation (0 results)')
    searchPage.clickOnPrisonTab()
    const comPage = searchPage.clickComName()
    searchPage = comPage.clickBackToCaSearch()
    const printALicencePage = searchPage.clickOffenderName()
    searchPage = printALicencePage.clickBackToCaSearch()
    const viewCasesPageExit = searchPage.clickBackToCaseload()
    viewCasesPageExit.signOut().click()
  })
})
