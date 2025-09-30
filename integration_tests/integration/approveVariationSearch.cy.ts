import Page from '../pages/page'
import IndexPage from '../pages'
import VaryApprovalSearchPage from '../pages/varyApproveSearchPage'

context('ACO search a licence variation', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubProbationAcoSignIn')
    cy.task('stubGetStaffDetails')
    cy.task('stubGetVaryApproverCaseload')
    cy.task('stubGetCompletedLicence', { statusCode: 'VARIATION_SUBMITTED', typeCode: 'AP' })
    cy.task('stubFeComponents')
    cy.signIn()
  })

  it('should click through search journey', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    const varyApproveCasesPage = indexPage.clickApproveAVariation()
    const searchPage = varyApproveCasesPage.clickSearch('test')
    searchPage.getSearchHeading().contains('Search results for test')
    Page.verifyOnPage(VaryApprovalSearchPage)
  })
})
