import Page from '../../pages/page'
import IndexPage from '../../pages'

context('ACO review a licence variation', () => {
  const curfewAddress = {
    firstLine: '123 Fake Street',
    secondLine: 'Apt 4',
    town: 'Faketown',
    county: 'Fakecounty',
    postcode: 'FK1 2AB',
    source: 'MANUAL',
    accommodationType: 'RESIDENTIAL',
    postReleaseResidentialChecksCompleted: false,
    postReleaseResidentialChecksNotCompletedReason: 'Reason for incomplete checks',
  }
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubProbationAcoSignIn')
    cy.task('stubGetStaffDetails')
    cy.task('stubGetVaryApproverCaseload')
    cy.task('stubGetCompletedLicence', {
      statusCode: 'VARIATION_SUBMITTED',
      typeCode: 'AP',
      kind: 'HDC_VARIATION',
      curfewAddress,
    })
    cy.task('stubRecordAuditEvent')
    cy.task('stubMatchLicenceEvents')
    cy.task('stubGetLicencePolicyConditions')
    cy.task('stubGetActivePolicyConditions')
    cy.task('stubFeComponents')
    cy.task('stubCheckComCaseAccess')
    cy.task('stubGetCaseAccessDetails')
    cy.signIn()
  })

  it('ACO approve a licence variation', () => {
    cy.task('stubApproveVariation')
    const indexPage = Page.verifyOnPage(IndexPage)
    let varyApproveCasesPage = indexPage.clickApproveAVariation()
    const varyApproveViewPage = varyApproveCasesPage.selectCase()
    varyApproveViewPage.checkResidentialChecksNotCompleted('Reason for incomplete checks')
    const varyApproveConfirmPage = varyApproveViewPage.clickApproveVariation()
    varyApproveCasesPage = varyApproveConfirmPage.clickBackToCaseList()
    varyApproveCasesPage.signOut().click()
  })
})
