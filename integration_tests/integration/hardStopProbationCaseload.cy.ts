import IndexPage from '../pages'
import Page from '../pages/page'

context('Create a licence', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubGetCaseloadItem')
    cy.task('stubProbationSignIn')
    cy.task('stubGetStaffDetails')
    cy.task('stubGetStaffDetailsByList')
    cy.task('stubGetOmuEmail')
    cy.signIn()
  })

  it('should redirect to prison-will-create-this-licence if a licence has timed out', () => {
    cy.task('stubGetLicencesForStatus', { status: 'TIMED_OUT' })
    cy.task('stubGetTimedOutLicence')
    const indexPage = Page.verifyOnPage(IndexPage)
    const caseloadPage = indexPage.clickCreateALicenceWithoutLicencesStub()
    caseloadPage.clickNameOfTimedOutLicence()
  })

  it('should redirect to licence-not-approved-in-time if the timed out licence is an edit of a previously approved licence', () => {
    cy.task('stubGetLicencesForStatus', { status: 'TIMED_OUT', versionOf: 1 })
    cy.task('stubGetTimedOutEditLicence')
    const indexPage = Page.verifyOnPage(IndexPage)
    const caseloadPage = indexPage.clickCreateALicenceWithoutLicencesStub()
    caseloadPage.clickNameOfTimedOutEdit()
  })

  it('should redirect to prison-will-create-this-licence if the prison-created licence is yet to be submitted', () => {
    cy.task('stubGetHardStopAndTimedOutLicences', 'IN_PROGRESS')
    cy.task('stubGetHardStopLicence')
    const indexPage = Page.verifyOnPage(IndexPage)
    const caseloadPage = indexPage.clickCreateALicenceWithoutLicencesStub()
    caseloadPage.clickNameOfTimedOutLicence()
  })

  it('should redirect to licence-created-by-prison if the licence was created by prison and has been submitted', () => {
    cy.task('stubGetHardStopAndTimedOutLicences', 'SUBMITTED')
    cy.task('stubGetHardStopLicence')
    const indexPage = Page.verifyOnPage(IndexPage)
    const caseloadPage = indexPage.clickCreateALicenceWithoutLicencesStub()
    caseloadPage.clickNameOfHardStopLicence()
  })
})
