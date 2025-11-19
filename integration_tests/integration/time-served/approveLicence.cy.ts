import Page from '../../pages/page'
import IndexPage from '../../pages'

context('Approve a licence - time served', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubPrisonSignIn')
    cy.task('stubGetPrisonUserDetails')
    cy.task('stubGetPrisons')
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
    cy.task('stubGetApprovalCaseload', { kind: 'TIME_SERVED', statusCode: 'IN_PROGRESS' })
    cy.task('stubGetCompletedLicence', {
      statusCode: 'SUBMITTED',
      kind: 'TIME_SERVED',
      isReviewNeeded: true,
      typeCode: 'AP',
    })
    cy.task('stubRecordAuditEvent')
    cy.task('stubGetStaffDetails')
    cy.task('stubUpdateLicenceStatus', 1)
    cy.task('stubFeComponents')
    cy.signIn()
  })

  afterEach(() => {
    cy.get('[data-qa=signOut]').click()
  })

  it('when time served licence then correct approval messages should be shown', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    const approvalCasesPage = indexPage.clickApproveALicence()
    const approvalViewPage = approvalCasesPage.clickApproveLicence()
    const confirmApprovePage = approvalViewPage.clickApprove()
    confirmApprovePage.checkThatPageHasTimeServedSubTextMessage()
    confirmApprovePage.checkThatPageHasTimeServedEmailTextMessage()
  })
})
