import Page from '../pages/page'
import IndexPage from '../pages'
import RestrictedDetailsPage from '../pages/restrictedDetails'

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

  it('should display LAO cases in people in prison tab with restricted information', () => {
    cy.task('stubGetComSearchResponsesWithLao')

    const indexPage = Page.verifyOnPage(IndexPage)
    const caseloadPage = indexPage.clickCreateALicenceToEdit()
    const searchPage = caseloadPage.clickSearch('A123456')

    searchPage.getSearchInput().should('have.value', 'A123456')
    searchPage.checkOnPage()

    searchPage.getRow(0).find('.search-offender-name').should('contain.text', 'Access restricted on NDelius')
    searchPage.getRow(0).find('#name-1>.search-offender-name>.govuk-hint').should('contain.text', 'CRN: A123456')
    searchPage.getRow(0).find('#licence-type-1').contains('Restricted')
    searchPage.getRow(0).find('#probation-practitioner-1').contains('Restricted')
    searchPage.getRow(0).find('#team-name-1').contains('Restricted')
    searchPage.getRow(0).find('#release-date-1').contains('Restricted')
    searchPage.getRow(0).find('#licence-status-1').contains('Restricted')

    searchPage.getRow(0).find('a[id^="name-button"]').should('exist')
    searchPage.getRow(0).find('a[data-qa="comLink"]').should('not.exist')

    cy.task('stubGetCaseAccessDetails')
    searchPage.clickLaoOffenderName()

    const restrictedDetailsPage = Page.verifyOnPage(RestrictedDetailsPage)
    restrictedDetailsPage
      .getRestrictedDetails()
      .contains('This record has been restricted due to sensitive information')
  })

  it('should display LAO cases in people on probation tab with restricted information', () => {
    cy.task('stubGetComSearchResponsesWithLaoOnProbation')

    const indexPage = Page.verifyOnPage(IndexPage)
    const caseloadPage = indexPage.clickCreateALicenceToEdit()
    const searchPage = caseloadPage.clickSearch('A123456')

    searchPage.clickOnProbationTab()
    searchPage.getProbationTabTitle().contains('People on probation (1 result)')

    searchPage.getRow(0).find('.search-offender-name').should('contain.text', 'Access restricted on NDelius')
    searchPage.getRow(0).find('#name-1>.search-offender-name>.govuk-hint').should('contain.text', 'CRN: A123456')
    searchPage.getRow(0).find('#licence-type-1').contains('Restricted')
    searchPage.getRow(0).find('#probation-practitioner-1').contains('Restricted')
    searchPage.getRow(0).find('#team-name-1').contains('Restricted')
    searchPage.getRow(0).find('#release-date-1').contains('Restricted')
    searchPage.getRow(0).find('#licence-status-1').contains('Restricted')

    searchPage.getRow(0).find('a[id^="name-button"]').should('exist')
    searchPage.getRow(0).find('a[data-qa="comLink"]').should('not.exist')

    cy.task('stubGetCaseAccessDetails')
    searchPage.clickLaoOffenderName()

    const restrictedDetailsPage = Page.verifyOnPage(RestrictedDetailsPage)
    restrictedDetailsPage
      .getRestrictedDetails()
      .contains('This record has been restricted due to sensitive information')
  })
})
