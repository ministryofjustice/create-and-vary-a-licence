import Page from '../pages/page'
import IndexPage from '../pages'
import ApprovalSearchPage from '../pages/approvalSearch'

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
    cy.task('stubGetCompletedLicence', { statusCode: 'SUBMITTED', typeCode: 'AP_PSS' })
    cy.task('stubGetApprovalCaseload')
    cy.task('stubRecordAuditEvent')
    cy.task('stubGetPrisonApproverSearchResults')
    cy.task('stubGetPrisons')
    cy.task('stubFeComponents')
    cy.task('stubGetStaffDetails')
    cy.signIn()
  })

  it('should click through search journey', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    const approvalCasesPage = indexPage.clickApproveALicence()
    approvalCasesPage.clickSearch('test')
    let searchPage = Page.verifyOnPage(ApprovalSearchPage)
    searchPage.getSearchHeading().contains('Search results for test')
    searchPage.getApprovalNeededTabTitle().contains('Approval needed (3 results)')
    searchPage.clickOnRecentlyApprovedTab()
    searchPage.getRecentlyApprovedTabTitle().contains('Recently approved (3 results)')
    searchPage.clickOnApprovalNeededTab()
    const comPage = searchPage.clickFirstComName()
    searchPage = comPage.clickBackToPrisonApproverSearch()
    const viewALicencePage = searchPage.clickOffenderName()
    searchPage = viewALicencePage.clickBackToPrisonApproverSearch()
    const viewCasesPageExit = searchPage.clickBackToCaseload()
    viewCasesPageExit.signOut().click()
  })

  it('should order approval needed cases by ascending release date', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    const approvalCasesPage = indexPage.clickApproveALicence()
    approvalCasesPage.clickSearch('test')
    const searchPage = Page.verifyOnPage(ApprovalSearchPage)
    searchPage.getSearchHeading().contains('Search results for test')
    searchPage.getReleaseDate(0).contains('01 Jul 2025')
    searchPage.getReleaseDate(1).contains('01 Aug 2025')
    searchPage.getReleaseDate(2).contains('02 Aug 2025')
  })

  it('should order recently approved cases by descending approved on date', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    const approvalCasesPage = indexPage.clickApproveALicence()
    approvalCasesPage.clickSearch('test')
    const searchPage = Page.verifyOnPage(ApprovalSearchPage)
    searchPage.getSearchHeading().contains('Search results for test')
    searchPage.clickOnRecentlyApprovedTab()
    searchPage.getApprovalDate(0).contains('13 Apr 2023')
    searchPage.getApprovalDate(1).contains('10 Apr 2023')
    searchPage.getApprovalDate(2).contains('12 Apr 2023')
  })
})
