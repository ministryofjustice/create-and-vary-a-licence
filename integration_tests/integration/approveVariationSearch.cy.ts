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

  it('should click through search journey and show empty states where no results are present', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    const varyApproveCasesPage = indexPage.clickApproveAVariation()
    const searchPage = varyApproveCasesPage.clickSearch('test')
    searchPage.getSearchHeading().contains('Search results for test')
    searchPage.getPduCasesTabTitle().contains('Cases in this PDU (0 results)')
    searchPage.getRegionCasesTabTitle().contains('All cases in this region (0 results)')
    Page.verifyOnPage(VaryApprovalSearchPage)
  })
})
