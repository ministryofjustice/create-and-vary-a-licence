import IndexPage from '../pages'
import Page from '../pages/page'

context('View COM create caseload', () => {
  const dates: string[] = []

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubProbationSignIn')
    cy.task('stubGetStaffDetails')
    cy.task('stubGetLicence', {})
    cy.task('stubGetOmuEmail')
    cy.task('stubGetBankHolidays', dates)
    cy.task('stubFeComponents')
    cy.task('stubCheckComCaseAccess')
    cy.task('stubGetProbationCase')
    cy.signIn()
  })

  it('should navigate to the com create caseload page and display offender details', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    let caseloadPage = indexPage.clickCreateALicence(true)
    cy.get('#name-1 .caseload-offender-name a').should('exist')
    cy.get('#name-1 .caseload-offender-name').should('contain', 'Test Person')
    cy.get('#release-date-1').should('contain', '1 Sep 2024')
    cy.get('#licence-status-1 .status-badge').should('exist')
    cy.get('#licence-status-1 .status-badge').should('contain', 'Not started')
    const confirmCreatePage = caseloadPage.clickNameToCreateLicence()
    caseloadPage = confirmCreatePage.clickReturnToCaseload()
    caseloadPage.signOut().click()
  })

  it('should navigate to the com create caseload page and display LAO case restrictions', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    let caseloadPage = indexPage.clickCreateALicenceWithLao()
    caseloadPage.getRow(0).within(() => {
      cy.get('#name-1 .caseload-offender-name a').should('exist')
      cy.get('#name-1 .caseload-offender-name').should('contain', 'Test Person')
      cy.get('#release-date-1').should('contain', '1 Sep 2024')
      cy.get('#licence-status-1 .status-badge').should('exist')
      cy.get('#licence-status-1 .status-badge').should('contain', 'Not started')
    })
    caseloadPage.getRow(1).within(() => {
      cy.get('#name-2 .caseload-offender-name a').should('exist')
      cy.get('#name-2 .caseload-offender-name').should('contain', 'Access Restricted in NDelius')
      cy.get('#release-date-2').should('contain', 'Restricted')
      cy.get('#licence-status-2 .status-badge').should('not.exist')
      cy.get('#licence-status-2').should('contain', 'Restricted')
    })
    const confirmCreatePage = caseloadPage.clickNameToCreateLicence()
    caseloadPage = confirmCreatePage.clickReturnToCaseload()
    caseloadPage.signOut().click()
  })

  it('The LAO restrictions should navigate to the restricted details page', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    const caseloadPage = indexPage.clickCreateALicenceWithLao()

    const restrictedDetailsPage = caseloadPage.clickRestrictedName()
    restrictedDetailsPage
      .getRestrictedDetails()
      .contains('This record has been restricted due to sensitive information')
  })
})
