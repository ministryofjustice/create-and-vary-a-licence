import Page from '../pages/page'
import IndexPage from '../pages'

context('Search for a person', () => {
  const dates: string[] = []

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubProbationSignIn')
    cy.task('stubGetStaffDetails')
    cy.task('stubGetLicence', {})
    cy.task('stubRecordAuditEvent')
    cy.task('stubGetLicencePolicyConditions')
    cy.task('stubGetBankHolidays', dates)
    cy.task('stubFeComponents')
    cy.signIn()
  })

  it('should click through search journey', () => {
    cy.task('stubGetComSearchResponses')

    const indexPage = Page.verifyOnPage(IndexPage)
    const caseloadPage = indexPage.clickCreateALicenceToEdit()
    let searchPage = caseloadPage.clickSearch('Test')
    const comPage = searchPage.clickComName()
    searchPage = comPage.clickBackToSearch()
    const checkAnswersPage = searchPage.clickOffenderName()
    const caseloadPageExit = checkAnswersPage.clickBackToCaseload()
    caseloadPageExit.signOut().click()
  })

  it('should sort search results by release date and name', () => {
    cy.task('stubGetProbationSearchMultipleResults')

    const indexPage = Page.verifyOnPage(IndexPage)
    const caseloadPage = indexPage.clickCreateALicenceToEdit()
    const searchPage = caseloadPage.clickSearch('Test')
    searchPage.getSearchInput().should('have.value', 'Test')

    searchPage.getPrisonTabTitle().contains('People in prison (3 results)')
    searchPage.getProbationTabTitle().contains('People on probation (2 results)')

    searchPage.getRow(0).contains('15 Aug 2023')
    searchPage.getRow(0).contains('Abc Person3')
    searchPage.getRow(1).contains('15 Aug 2023')
    searchPage.getRow(1).contains('Def Person2')
    searchPage.getRow(2).contains('16 Aug 2023')
    searchPage.getRow(2).contains('Test Person')

    searchPage.clickOnProbationTab()
    searchPage.getRow(3).contains('Test Person5')
    searchPage.getRow(3).contains('17 Aug 2023')
    searchPage.getRow(4).contains('Test Person4')
    searchPage.getRow(4).contains('15 Aug 2023')
  })
})
