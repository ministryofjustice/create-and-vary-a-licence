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

  it('when time served licence and no probation practitioner then com details say not allocated', () => {
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
    const approvalViewPage = approvalCasesPage.clickApproveLicence()
    approvalViewPage.clickProbationPractitionerDetails()
    approvalViewPage.checkProbationPractitionerDetailsNotAllocated()
  })

  it('when time served approval case has not been allocated a probationPractitioner then show "Not allocated yet"', () => {
    cy.task('stubGetApprovalCaseload', { kind: 'TIME_SERVED', statusCode: 'SUBMITTED', probationPractitioner: null })

    const indexPage = Page.verifyOnPage(IndexPage)
    const approvalCasesPage = indexPage.clickApproveALicence()
    approvalCasesPage.hasNotAllocatedYetTextForProbationPractitioner(1)
  })

  it('when time served recently approved cases page has not been allocated a probationPractitioner then show "Not allocated yet"', () => {
    cy.task('stubGetApprovalCaseload', {})
    cy.task('stubGetRecentlyApprovedCaseload', { probationPractitioner: null, kind: 'TIME_SERVED' })

    const indexPage = Page.verifyOnPage(IndexPage)
    const approvalCasesPage = indexPage.clickApproveALicence()
    approvalCasesPage.clickRecentlyApprovedLink()
    approvalCasesPage.hasNotAllocatedYetTextForProbationPractitioner(1)
  })
})
