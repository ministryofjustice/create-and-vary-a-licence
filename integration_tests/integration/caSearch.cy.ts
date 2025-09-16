import Page from '../pages/page'
import IndexPage from '../pages'
import ChangeLocationPage from '../pages/changeLocationPage'

context('Search for a person', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubPrisonSignIn')
    cy.task('stubGetPrisonUserDetails')
    cy.task('stubGetPrisonOmuCaseload')
    cy.task('stubGetProbationOmuCaseload')
    cy.task('stubGetPrisons')
    cy.task('stubFeComponents')
    cy.task('stubGetCompletedLicence', { statusCode: 'APPROVED', typeCode: 'AP_PSS' })
    cy.task('stubRecordAuditEvent')
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

  it('should click through the ca search journey', () => {
    cy.task('stubGetCaSearchResults')
    cy.task('stubGetPrisonUserCaseloads', singleCaseload)
    cy.signIn()
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
    cy.task('stubGetCaSearchResults')
    cy.task('stubGetPrisonUserCaseloads', singleCaseload)
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    const caseloadPage = indexPage.clickViewAndPrintALicence()
    const searchPage = caseloadPage.clickSearch('test')
    searchPage.getSearchHeading().contains('Search results for test')
    // check people in prison are ordered by descending release date by default
    searchPage.getRow(0).contains('1 Jul 2025')
    searchPage.getRow(1).contains('1 Aug 2025')
    searchPage.getRow(2).contains('2 Aug 2025')
    // second click sorts ascending
    searchPage.clickSortByReleaseDate()
    searchPage.getRow(0).contains('2 Aug 2025')
    searchPage.getRow(1).contains('1 Aug 2025')
    searchPage.getRow(2).contains('1 Jul 2025')
    searchPage.clickOnProbationTab()
    // check people on probation are ordered by ascending release date by default
    searchPage.getRow(3).contains('1 May 2025')
    searchPage.getRow(4).contains('30 Apr 2025')
    searchPage.getRow(5).contains('29 Apr 2025')
  })

  it('should show attention needed tab when attention needed type cases present', () => {
    cy.task('stubGetCaSearchResults')
    cy.task('stubGetPrisonUserCaseloads', singleCaseload)
    cy.signIn()
    cy.task('stubGetCaSearchAttentionNeededPrisonResults')
    const indexPage = Page.verifyOnPage(IndexPage)
    const caseloadPage = indexPage.clickViewAndPrintALicence()
    const searchPage = caseloadPage.clickSearch('test')
    searchPage.getSearchHeading().contains('Search results for test')
    searchPage.clickAttentionNeededTab()
    searchPage.getAttentionNeededTabTitle().contains('Attention needed (3 results)')
    // check attention needed cases are ordered by descending nomis legal status by default
    searchPage.getRow(3).contains('Sentenced')
    searchPage.getRow(4).contains('Remand')
    searchPage.getRow(5).contains('Recall')
  })

  it("should not show caseload information because doesn't have multiple caseloads", () => {
    cy.task('stubGetCaSearchInPrisonResult')
    cy.task('stubGetPrisonUserCaseloads', singleCaseload)
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    const viewCasesList = indexPage.clickViewAndPrintALicence()
    const searchPage = viewCasesList.clickSearch('test')
    searchPage.getChangeCaseloadOption().should('not.exist')
  })

  it('should allow user to change caseload', () => {
    cy.task('stubGetCaSearchInPrisonResult')
    cy.task('stubGetPrisonUserCaseloads', multipleCaseloads)
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    const viewCasesList = indexPage.clickViewAndPrintALicence()
    const searchPage = viewCasesList.clickSearch('test')
    searchPage.getChangeCaseloadOption().should('exist')
    searchPage.getCaseloadNames().contains('Leeds (HMP)')
    searchPage.clickChangeLocationsLink()
    const changeLocationPage = Page.verifyOnPage(ChangeLocationPage)
    changeLocationPage.clickCheckBox('Leeds')
    changeLocationPage.clickCheckBox('Moorland')
    changeLocationPage.clickContinue()
    searchPage.getCaseloadNames().contains('Leeds (HMP), Moorland (HMP)')
  })

  it('change caseload cancel link should return user to their original in prison view', () => {
    cy.task('stubGetCaSearchInPrisonResult')
    cy.task('stubGetPrisonUserCaseloads', multipleCaseloads)
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    const viewCasesList = indexPage.clickViewAndPrintALicence()
    const searchPage = viewCasesList.clickSearch('test')
    searchPage.clickChangeLocationsLink()
    const changeLocationPage = Page.verifyOnPage(ChangeLocationPage)
    changeLocationPage.clickCancelForCaSearch('test')
    cy.url().should('eq', 'http://localhost:3007/search/ca-search?queryTerm=test#people-in-prison')
  })

  it('change caseload cancel link should return user to their original on probation view', () => {
    cy.task('stubGetCaSearchOnProbationResult')
    cy.task('stubGetPrisonUserCaseloads', multipleCaseloads)
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    const viewCasesList = indexPage.clickViewAndPrintALicence()
    const searchPage = viewCasesList.clickSearch('test')
    searchPage.clickChangeLocationsLink()
    const changeLocationPage = Page.verifyOnPage(ChangeLocationPage)
    changeLocationPage.clickCancelForCaSearch('test')
    cy.url().should('eq', 'http://localhost:3007/search/ca-search?queryTerm=test#people-on-probation')
  })

  it('change caseload continue button should return user to their original in prison view', () => {
    cy.task('stubGetCaSearchInPrisonResult')
    cy.task('stubGetPrisonUserCaseloads', multipleCaseloads)
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    const viewCasesList = indexPage.clickViewAndPrintALicence()
    const searchPage = viewCasesList.clickSearch('test')
    searchPage.clickChangeLocationsLink()
    const changeLocationPage = Page.verifyOnPage(ChangeLocationPage)
    changeLocationPage.clickCheckBox('Leeds')
    changeLocationPage.clickContinue()
    cy.url().should('eq', 'http://localhost:3007/search/ca-search?queryTerm=test#people-in-prison')
  })

  it('change caseload continue button should return user to their original on probation view', () => {
    cy.task('stubGetCaSearchOnProbationResult')
    cy.task('stubGetPrisonUserCaseloads', multipleCaseloads)
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    const viewCasesList = indexPage.clickViewAndPrintALicence()
    const searchPage = viewCasesList.clickSearch('test')
    searchPage.clickChangeLocationsLink()
    const changeLocationPage = Page.verifyOnPage(ChangeLocationPage)
    changeLocationPage.clickCheckBox('Leeds')
    changeLocationPage.clickContinue()
    cy.url().should('eq', 'http://localhost:3007/search/ca-search?queryTerm=test#people-on-probation')
  })

  it('Should display errors if Continue without selecting any checkbox', () => {
    cy.task('stubGetCaSearchInPrisonResult')
    cy.task('stubGetPrisonUserCaseloads', multipleCaseloads)
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    const viewCasesList = indexPage.clickViewAndPrintALicence()
    const searchPage = viewCasesList.clickSearch('test')
    searchPage.clickChangeLocationsLink()
    const changeLocationPage = Page.verifyOnPage(ChangeLocationPage)
    changeLocationPage.clickContinue()
    changeLocationPage.getErrorSummary().should('exist')
  })
})
