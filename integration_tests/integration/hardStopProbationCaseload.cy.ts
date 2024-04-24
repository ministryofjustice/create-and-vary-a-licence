import IndexPage from '../pages'
import Page from '../pages/page'

context('Create a licence', () => {
  const dates: string[] = []

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubGetCaseloadItemInHardStop')
    cy.task('stubProbationSignIn')
    cy.task('stubGetStaffDetails')
    cy.task('stubGetStaffDetailsByList')
    cy.task('stubGetOmuEmail')
    cy.task('stubGetBankHolidays', dates)
    cy.task('stubFeComponents')
    cy.task('searchPrisonersByNomisIdsInHardStop')
    cy.signIn()
  })

  it('should redirect to prison-will-create-this-licence if the licence was NOT_STARTED and is now TIMED_OUT', () => {
    cy.task('stubGetExistingLicenceForOffenderNoResult')
    const indexPage = Page.verifyOnPage(IndexPage)
    const caseloadPage = indexPage.clickCreateALicenceInHardStop()
    caseloadPage.clickNameOfTimedOutLicence()
  })

  it('should redirect to prison-will-create-this-licence if a licence has timed out', () => {
    cy.task('stubGetLicencesForStatus', { status: 'TIMED_OUT' })
    cy.task('stubGetTimedOutLicence')
    const indexPage = Page.verifyOnPage(IndexPage)
    const caseloadPage = indexPage.clickCreateALicenceInHardStop()
    caseloadPage.clickNameOfTimedOutLicence()
  })

  it('should redirect to licence-not-approved-in-time if the timed out licence is an edit of a previously approved licence', () => {
    cy.task('stubGetPreviouslyApprovedAndTimedOutLicences')
    cy.task('stubGetApprovedLicenceInHardStop')
    const indexPage = Page.verifyOnPage(IndexPage)
    const caseloadPage = indexPage.clickCreateALicenceInHardStop()
    caseloadPage.clickNameOfTimedOutEdit()
  })

  it('should redirect to prison-will-create-this-licence if the prison-created licence is yet to be submitted', () => {
    cy.task('stubGetHardStopAndTimedOutLicences', 'IN_PROGRESS')
    cy.task('stubGetHardStopLicence')
    const indexPage = Page.verifyOnPage(IndexPage)
    const caseloadPage = indexPage.clickCreateALicenceInHardStop()
    caseloadPage.clickNameOfTimedOutLicence()
  })

  it('should redirect to licence-created-by-prison if the licence was created by prison and has been submitted', () => {
    cy.task('stubGetHardStopAndTimedOutLicences', 'SUBMITTED')
    cy.task('stubGetHardStopLicence')
    const indexPage = Page.verifyOnPage(IndexPage)
    const caseloadPage = indexPage.clickCreateALicenceInHardStop()
    caseloadPage.clickNameOfHardStopLicence()
  })
})
