import Page from '../pages/page'
import IndexPage from '../pages'

context('Vary a licence', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubProbationSignIn')
    cy.task('stubGetStaffDetails')
    cy.task('stubGetManagedOffenders')
    cy.task('stubGetLicencesForOffender', { nomisId: 'G9786GC', status: 'ACTIVE' })
    cy.task('stubGetCompletedLicence', 'ACTIVE')
    cy.task('stubGetStaffDetailsByList')
    cy.task('stubRecordAuditEvent')
    cy.signIn()
  })

  it('should click through the vary a licence journey', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    const varyCasesPage = indexPage.clickVaryALicence()
    const varyViewPage = varyCasesPage.selectCase()

    varyViewPage.signOut().click()
  })
})
