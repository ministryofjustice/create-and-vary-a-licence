import Page from '../pages/page'
import IndexPage from '../pages'
import ApprovalSearchPage from '../pages/approvalSearch'

context('Search for a person', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubPrisonSignIn')
    cy.task('stubGetPrisonUserDetails')
    cy.task('stubGetPrisonUserCaseloads', {
      details: [
        {
          caseLoadId: 'LEI',
          caseloadFunction: 'GENERAL',
          currentlyActive: true,
          description: 'Leeds (HMP)',
          type: 'INST',
        },
      ],
    })
    cy.task('stubGetCompletedLicence', { statusCode: 'SUBMITTED', typeCode: 'AP_PSS' })
    cy.task('stubGetApprovalCaseload')
    cy.task('stubGetPrisons')
    cy.task('stubFeComponents')
    cy.signIn()
  })

  it('should click through search journey', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    const approvalCasesPage = indexPage.clickApproveALicence()
    const searchPage = approvalCasesPage.clickSearch('test')
    searchPage.getSearchHeading().contains('Search results for test')
    Page.verifyOnPage(ApprovalSearchPage)
  })
})
