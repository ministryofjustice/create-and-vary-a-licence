import Page from '../pages/page'
import IndexPage from '../pages'
import ApprovalSearchPage from '../pages/approvalSearch'
import ChangeLocationPage from '../pages/changeLocationPage'

context('Search for a person', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubPrisonSignIn')
    cy.task('stubGetPrisonUserDetails')
    cy.task('stubGetCompletedLicence', { statusCode: 'SUBMITTED', typeCode: 'AP_PSS' })
    cy.task('stubGetApprovalCaseload')
    cy.task('stubRecordAuditEvent')
    cy.task('stubGetPrisons')
    cy.task('stubFeComponents')
    cy.task('stubGetStaffDetails')
  })

  const singleCaseload = {
    details: [
      {
        caseLoadId: 'LEI',
        caseloadFunction: 'GENERAL',
        currentlyActive: true,
        description: 'Leeds (HMP)',
        type: 'INST',
      },
    ],
  }
  const multipleCaseloads = {
    details: [
      {
        caseLoadId: 'LEI',
        caseloadFunction: 'GENERAL',
        currentlyActive: true,
        description: 'Leeds (HMP)',
        type: 'INST',
      },
      {
        caseLoadId: 'MDI',
        caseloadFunction: 'GENERAL',
        currentlyActive: false,
        description: 'Moorland (HMP)',
        type: 'INST',
      },
      {
        caseLoadId: 'BAI',
        caseloadFunction: 'GENERAL',
        currentlyActive: false,
        description: 'Belmarsh (HMP)',
        type: 'INST',
      },
    ],
  }

  it('should click through search journey', () => {
    cy.task('stubGetPrisonApproverSearchResults')
    cy.task('stubGetPrisonUserCaseloads', singleCaseload)
    cy.signIn()
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
    cy.task('stubGetPrisonApproverSearchResults')
    cy.task('stubGetPrisonUserCaseloads', singleCaseload)
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    const approvalCasesPage = indexPage.clickApproveALicence()
    approvalCasesPage.clickSearch('test')
    const searchPage = Page.verifyOnPage(ApprovalSearchPage)
    searchPage.getSearchHeading().contains('Search results for test')
    searchPage.getReleaseDate(0).contains('1 Jul 2025')
    searchPage.getReleaseDate(1).contains('1 Aug 2025')
    searchPage.getReleaseDate(2).contains('2 Aug 2025')
  })

  it('should order recently approved cases by descending approved on date', () => {
    cy.task('stubGetPrisonApproverSearchResults')
    cy.task('stubGetPrisonUserCaseloads', singleCaseload)
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    const approvalCasesPage = indexPage.clickApproveALicence()
    approvalCasesPage.clickSearch('test')
    const searchPage = Page.verifyOnPage(ApprovalSearchPage)
    searchPage.getSearchHeading().contains('Search results for test')
    searchPage.clickOnRecentlyApprovedTab()
    searchPage.getApprovalDate(0).contains('13 Apr 2023')
    searchPage.getApprovalDate(1).contains('12 Apr 2023')
    searchPage.getApprovalDate(2).contains('10 Apr 2023')
  })

  it("should not show caseload information because doesn't have multiple caseloads", () => {
    cy.task('stubGetPrisonApproverSearchApprovalNeededResult')
    cy.task('stubGetPrisonUserCaseloads', singleCaseload)
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    const approvalCasesPage = indexPage.clickApproveALicence()
    const searchPage = approvalCasesPage.clickSearch('test')
    searchPage.getChangeCaseloadOption().should('not.exist')
  })

  it('should allow user to change caseload', () => {
    cy.task('stubGetPrisonApproverSearchApprovalNeededResult')
    cy.task('stubGetPrisonUserCaseloads', multipleCaseloads)
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    const approvalCasesPage = indexPage.clickApproveALicence()
    const searchPage = approvalCasesPage.clickSearch('test')
    searchPage.getChangeCaseloadOption().should('exist')
    searchPage.getCaseloadNames().contains('Leeds (HMP)')
    searchPage.clickChangeLocationsLink()
    const changeLocationPage = Page.verifyOnPage(ChangeLocationPage)
    changeLocationPage.clickCheckBox('Leeds')
    changeLocationPage.clickCheckBox('Moorland')
    changeLocationPage.clickContinue()
    searchPage.getCaseloadNames().contains('Leeds (HMP), Moorland (HMP)')
  })

  it('change caseload cancel link should return user to their original approval needed view', () => {
    cy.task('stubGetPrisonApproverSearchApprovalNeededResult')
    cy.task('stubGetPrisonUserCaseloads', multipleCaseloads)
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    const approvalCasesPage = indexPage.clickApproveALicence()
    const searchPage = approvalCasesPage.clickSearch('test')
    searchPage.clickChangeLocationsLink()
    const changeLocationPage = Page.verifyOnPage(ChangeLocationPage)
    changeLocationPage.clickCancelForApproverSearch('test')
    cy.url().should('eq', 'http://localhost:3007/search/approver-search?queryTerm=test#approval-needed')
  })

  it('change caseload cancel link should return user to their original on recently approved view', () => {
    cy.task('stubGetPrisonApproverSearchRecentlyApprovedResult')
    cy.task('stubGetPrisonUserCaseloads', multipleCaseloads)
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    const approvalCasesPage = indexPage.clickApproveALicence()
    const searchPage = approvalCasesPage.clickSearch('test')
    searchPage.clickChangeLocationsLink()
    const changeLocationPage = Page.verifyOnPage(ChangeLocationPage)
    changeLocationPage.clickCancelForApproverSearch('test')
    cy.url().should('eq', 'http://localhost:3007/search/approver-search?queryTerm=test#recently-approved')
  })

  it('change caseload continue button should return user to their original in approval needed view', () => {
    cy.task('stubGetPrisonApproverSearchApprovalNeededResult')
    cy.task('stubGetPrisonUserCaseloads', multipleCaseloads)
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    const approvalCasesPage = indexPage.clickApproveALicence()
    const searchPage = approvalCasesPage.clickSearch('test')
    searchPage.clickChangeLocationsLink()
    const changeLocationPage = Page.verifyOnPage(ChangeLocationPage)
    changeLocationPage.clickCheckBox('Leeds')
    changeLocationPage.clickContinue()
    cy.url().should('eq', 'http://localhost:3007/search/approver-search?queryTerm=test#approval-needed')
  })

  it('change caseload continue button should return user to their original on recently approved view', () => {
    cy.task('stubGetPrisonApproverSearchRecentlyApprovedResult')
    cy.task('stubGetPrisonUserCaseloads', multipleCaseloads)
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    const approvalCasesPage = indexPage.clickApproveALicence()
    const searchPage = approvalCasesPage.clickSearch('test')
    searchPage.clickChangeLocationsLink()
    const changeLocationPage = Page.verifyOnPage(ChangeLocationPage)
    changeLocationPage.clickCheckBox('Leeds')
    changeLocationPage.clickContinue()
    cy.url().should('eq', 'http://localhost:3007/search/approver-search?queryTerm=test#recently-approved')
  })

  it('Should display errors if Continue without selecting any checkbox', () => {
    cy.task('stubGetPrisonApproverSearchResults')
    cy.task('stubGetPrisonUserCaseloads', multipleCaseloads)
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    const approvalCasesPage = indexPage.clickApproveALicence()
    const searchPage = approvalCasesPage.clickSearch('test')
    searchPage.clickChangeLocationsLink()
    const changeLocationPage = Page.verifyOnPage(ChangeLocationPage)
    changeLocationPage.clickContinue()
    changeLocationPage.getErrorSummary().should('exist')
  })
})
