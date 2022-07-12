import Page from '../pages/page'
import IndexPage from '../pages'

context('View and print licence', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubPrisonSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetPrisonUserDetails')
    cy.task('stubGetPrisonUserCaseloads')
    cy.task('stubGetLicencesForOffender', { nomisId: 'G9786GC', status: 'APPROVED' })
    cy.task('stubGetOffendersByNomsNumber')
    cy.task('searchPrisonersByNomisIds')
    cy.task('searchPrisonersByReleaseDate')
    cy.task('stubGetStaffDetailsByList')
    cy.task('stubGetStaffDetailsByStaffCode')
    cy.task('stubGetCompletedLicence', 'APPROVED')
    cy.task('stubGetHdcStatus')
    cy.task('stubRecordAuditEvent')
    cy.task('stubGetPrisons')
    cy.signIn()
  })

  it('should click through the view and print a licence journey', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    let viewCasesList = indexPage.clickViewAndPrintALicence()
    const comDetails = viewCasesList.clickComDetails()
    viewCasesList = comDetails.clickReturn()
    const viewLicencePage = viewCasesList.clickALicence()
    const printALicencePage = viewLicencePage.printALicence()
    printALicencePage.checkPrintTemplate()
  })
})
