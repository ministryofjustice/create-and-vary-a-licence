import Page from '../pages/page'
import IndexPage from '../pages'

context('Reject a licence', () => {
  const singleCaseload = {
    details: [
      {
        caseLoadId: 'LEI',
        caseloadFunction: 'GENERAL',
        currentlyActive: true,
        description: 'Leeds (HMP)',
        type: 'INST',
      },
    ],
  }

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubPrisonSignIn')
    cy.task('stubAuthUser')
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
    cy.task('stubGetCompletedLicence', 'SUBMITTED')
    cy.task('stubGetLicencesForStatus', 'SUBMITTED')
    cy.task('stubGetOffendersByNomsNumber')
    cy.task('searchPrisonersByNomisIds')
    cy.task('stubUpdateLicenceStatus', 1)
    cy.task('stubGetStaffDetailsByList')
    cy.task('stubRecordAuditEvent')
    cy.task('stubGetPrisons')
    cy.task('stubGetPrisonUserCaseloads', singleCaseload)
    cy.signIn()
  })

  it('should click through the reject a licence journey', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    const approvalCasesPage = indexPage.clickApproveALicence()
    const approvalViewPage = approvalCasesPage.clickApproveLicence()
    const confirmRejectPage = approvalViewPage.clickReject()
    const approvalCasesPage2 = confirmRejectPage.clickReturnToList()
    approvalCasesPage2.signOut().click()
  })
})
