import LicenceCreationType from '../../server/enumeration/licenceCreationType'
import LicenceStatus from '../../server/enumeration/licenceStatus'
import IndexPage from '../pages'
import Page from '../pages/page'

context('View COM vary caseload', () => {
  const dates: string[] = []

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubProbationSignIn')
    cy.task('stubGetStaffDetails')
    cy.task('stubGetLicencesForOffender', { nomisId: 'G9786GC', kind: 'VARIATION', status: 'ACTIVE' })
    cy.task('stubGetCompletedLicence', { statusCode: 'ACTIVE', typeCode: 'AP_PSS' })
    cy.task('stubGetStaffVaryCaseload', {
      licenceId: 1,
      licenceStatus: LicenceStatus.ACTIVE,
      licenceCreationType: LicenceCreationType.LICENCE_NOT_STARTED,
    })
    cy.task('stubGetBankHolidays', dates)
    cy.task('stubFeComponents')
    cy.task('stubCheckComCaseAccess')
    cy.signIn()
  })

  it('should navigate to the com vary caseload page and display offender details', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    let caseloadPage = indexPage.clickVaryALicence()
    caseloadPage.getValue(caseloadPage.myCount).should('contain.text', '1')
    caseloadPage.getValue(caseloadPage.teamCount).should('contain.text', '5')
    caseloadPage.getRow(0).within(() => {
      cy.get('#name-1 .caseload-offender-name a').should('exist')
      cy.get('#name-1 .caseload-offender-name').should('contain', 'Test Person')
      cy.get('#licence-type-1').should('contain', 'Post sentence supervision')
      cy.get('#probation-practitioner-1 a').should('exist')
      cy.get('#probation-practitioner-1').should('contain', 'John Smith')
      cy.get('#release-date-1').should('contain', '1 Sep 2024')
      cy.get('#licence-status-1 .status-badge').should('exist')
      cy.get('#licence-status-1 .status-badge').should('contain', 'Active')
    })
    const timelinePage = caseloadPage.selectCase()
    caseloadPage = timelinePage.clickReturnToCaseload()
    const comDetailsPage = caseloadPage.clickProbationPractitioner(1)
    comDetailsPage.clickBackToVaryCaseload()
    caseloadPage.signOut().click()
  })

  it('should navigate to the com vary caseload page and display LAO case restrictions', () => {
    cy.task('stubGetStaffVaryCaseloadWithLao')
    const indexPage = Page.verifyOnPage(IndexPage)
    let caseloadPage = indexPage.clickVaryALicence()
    caseloadPage.getRow(0).within(() => {
      cy.get('#name-1 .caseload-offender-name a').should('exist')
      cy.get('#name-1 .caseload-offender-name').should('contain', 'Test Person')
      cy.get('#licence-type-1').should('contain', 'Post sentence supervision')
      cy.get('#probation-practitioner-1 a').should('exist')
      cy.get('#probation-practitioner-1').should('contain', 'John Smith')
      cy.get('#release-date-1').should('contain', '1 Sep 2024')
      cy.get('#licence-status-1 .status-badge').should('exist')
      cy.get('#licence-status-1 .status-badge').should('contain', 'Active')
    })
    caseloadPage.getRow(1).within(() => {
      cy.get('#name-2 .caseload-offender-name a').should('not.exist')
      cy.get('#name-2 .caseload-offender-name').should('contain', 'Access Restricted in NDelius')
      cy.get('#licence-type-2').should('contain', 'Restricted')
      cy.get('#probation-practitioner-2 a').should('not.exist')
      cy.get('#probation-practitioner-2').should('contain', 'Restricted')
      cy.get('#release-date-2').should('contain', 'Restricted')
      cy.get('#licence-status-2 .status-badge').should('not.exist')
      cy.get('#licence-status-2').should('contain', 'Restricted')
    })
    const timelinePage = caseloadPage.selectCase()
    caseloadPage = timelinePage.clickReturnToCaseload()
    const comDetailsPage = caseloadPage.clickProbationPractitioner(1)
    comDetailsPage.clickBackToVaryCaseload()
    caseloadPage.signOut().click()
  })
})
