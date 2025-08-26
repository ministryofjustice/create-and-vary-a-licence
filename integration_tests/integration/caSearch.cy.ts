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
    searchPage.getAttentionNeededTabTitle().should('not.exist')
    searchPage.getPrisonTabTitle().contains('People in prison (3 results)')
    searchPage.clickOnProbationTab()
    searchPage.getProbationTabTitle().contains('People on probation (3 results)')
    searchPage.clickOnPrisonTab()
    const comPage = searchPage.clickFirstComName()
    searchPage = comPage.clickBackToCaSearch()
    const printALicencePage = searchPage.clickOffenderName()
    searchPage = printALicencePage.clickBackToCaSearch()
    const viewCasesPageExit = searchPage.clickBackToCaseload()
    viewCasesPageExit.signOut().click()
  })

  it('should order by release date', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    const caseloadPage = indexPage.clickViewAndPrintALicence()
    const searchPage = caseloadPage.clickSearch('test')
    searchPage.getSearchHeading().contains('Search results for test')
    // check people in prison are ordered by ascending release date by default
    searchPage.getRow(0).contains('01 Jul 2025')
    searchPage.getRow(1).contains('01 Aug 2025')
    searchPage.getRow(2).contains('02 Aug 2025')
    // first click sorts ascending but already ascending by default
    searchPage.clickSortByReleaseDate()
    // second click sorts descending
    searchPage.clickSortByReleaseDate()
    searchPage.getRow(0).contains('02 Aug 2025')
    searchPage.getRow(1).contains('01 Aug 2025')
    searchPage.getRow(2).contains('01 Jul 2025')
    searchPage.clickOnProbationTab()
    // check people on probation are ordered by descending release date by default
    searchPage.getRow(3).contains('01 May 2025')
    searchPage.getRow(4).contains('30 Apr 2025')
    searchPage.getRow(5).contains('29 Apr 2025')
  })

  it('should show attention needed tab when attention needed type cases present', () => {
    cy.task('stubGetCaSearchAttentionNeededPrisonResults')
    const indexPage = Page.verifyOnPage(IndexPage)
    const caseloadPage = indexPage.clickViewAndPrintALicence()
    const searchPage = caseloadPage.clickSearch('test')
    searchPage.getSearchHeading().contains('Search results for test')
    searchPage.clickAttentionNeededTab()
    searchPage.getAttentionNeededTabTitle().contains('Attention needed')
    // check attention needed cases are ordered by descending nomis legal status by default
    searchPage.getRow(3).contains('Sentenced')
    searchPage.getRow(4).contains('Remand')
    searchPage.getRow(5).contains('Recall')
  })
})
