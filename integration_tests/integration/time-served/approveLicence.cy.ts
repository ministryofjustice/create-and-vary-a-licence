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
    cy.task('stubGetApprovalCaseload', { kind: 'TIME_SERVED', statusCode: 'SUBMITTED' })
    cy.task('stubFeComponents')
    cy.signIn()
    Page.verifyOnPage(IndexPage)
  })

  afterEach(() => {
    cy.get('[data-qa=signOut]').click()
  })

  it('when time served licence then correct approval messages should be shown', () => {
    cy.task('stubRecordAuditEvent')
    cy.task('stubGetStaffDetails')
    cy.task('stubGetCompletedLicence', {
      statusCode: 'SUBMITTED',
      kind: 'TIME_SERVED',
      isReviewNeeded: true,
      typeCode: 'AP',
    })
    cy.task('stubUpdateLicenceStatus', 1)

    const indexPage = Page.verifyOnPage(IndexPage)
    const approvalCasesPage = indexPage.clickApproveALicence()
    const approvalViewPage = approvalCasesPage.clickApproveLicence()
    const confirmApprovePage = approvalViewPage.clickApprove()
    confirmApprovePage.checkThatPageHasTimeServedSubTextMessage()
    confirmApprovePage.checkThatPageHasTimeServedEmailTextMessage()
  })

  it('when probation practitioner has not been allocated then show ay not allocated yet', () => {
    cy.task('stubGetApprovalCaseload', { kind: 'TIME_SERVED', statusCode: 'SUBMITTED', probationPractitioner: null })
    cy.task('stubGetRecentlyApprovedCaseload', { probationPractitioner: null, kind: 'TIME_SERVED' })

    cy.task('stubRecordAuditEvent')
    cy.task('stubGetStaffDetails')
    cy.task('stubGetCompletedLicence', {
      statusCode: 'SUBMITTED',
      kind: 'TIME_SERVED',
      isReviewNeeded: true,
      typeCode: 'AP',
      comUsername: null,
    })
    cy.task('stubUpdateLicenceStatus', 1)

    const indexPage = Page.verifyOnPage(IndexPage)

    const approvalCasesPage = indexPage.clickApproveALicence()

    // Verify not allocated on recently approved cases page
    approvalCasesPage.clickRecentlyApprovedLink()
    approvalCasesPage.hasNotAllocatedYetTextForProbationPractitioner(1)

    // Verify not allocated yet on approval cases page
    approvalCasesPage.clickApprovalNeededTab()
    approvalCasesPage.hasNotAllocatedYetTextForProbationPractitioner(1)

    // Verify not allocated yet on approval view page
    const approvalViewPage = approvalCasesPage.clickApproveLicence()
    approvalViewPage.clickProbationPractitionerDetails()
    approvalViewPage.checkProbationPractitionerDetailsNotAllocated()

    // Verify not allocated yet on confirm approve page
    const confirmApprovePage = approvalViewPage.clickApprove()
    confirmApprovePage.checkThatPageHasTimeServedSubTextMessage()
    confirmApprovePage.checkThatPageHasTimeServedEmailTextMessage()
  })
})
