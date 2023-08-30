import Page from '../pages/page'
import IndexPage from '../pages'

context('Search for a person', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubProbationSignIn')
    cy.task('stubGetStaffDetails')
    cy.task('stubAuthUser')
    cy.task('stubGetLicence')
    cy.task('stubRecordAuditEvent')
    cy.task('stubGetLicencePolicyConditions')
    cy.signIn()
  })

  it('should click through search journey', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    const caseloadPage = indexPage.clickCreateALicenceToEdit()
    let searchPage = caseloadPage.clickSearch('test')
    const comPage = searchPage.clickComName()
    searchPage = comPage.clickBackToSearch()
    const checkAnswersPage = searchPage.clickOffenderName()
    const caseloadPageExit = checkAnswersPage.clickBackToCaseload()
    caseloadPageExit.signOut().click()
  })
})
