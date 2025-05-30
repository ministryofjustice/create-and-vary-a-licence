import Page from '../pages/page'
import IndexPage from '../pages'

context('ACO review a licence variation', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubProbationAcoSignIn')
    cy.task('stubGetStaffDetails')
    cy.task('stubGetVaryApproverCaseload')
    cy.task('stubGetCompletedLicence', { statusCode: 'VARIATION_SUBMITTED', typeCode: 'AP' })
    cy.task('stubRecordAuditEvent')
    cy.task('stubMatchLicenceEvents')
    cy.task('stubGetLicencePolicyConditions')
    cy.task('stubGetActivePolicyConditions')
    cy.task('stubFeComponents')
    cy.signIn()
  })

  it('ACO approve a licence variation', () => {
    cy.task('stubApproveVariation')
    const indexPage = Page.verifyOnPage(IndexPage)
    let varyApproveCasesPage = indexPage.clickApproveAVariation()
    const varyApproveViewPage = varyApproveCasesPage.selectCase()
    const varyApproveConfirmPage = varyApproveViewPage.clickApproveVariation()
    varyApproveCasesPage = varyApproveConfirmPage.clickBackToCaseList()
    varyApproveCasesPage.signOut().click()
  })

  it('ACO approve a licence variation in another region', () => {
    cy.task('stubApproveVariation')
    const indexPage = Page.verifyOnPage(IndexPage)
    let varyApproveCasesPage = indexPage.clickApproveAVariation()
    const varyApproveAllRegions = varyApproveCasesPage.clickViewAllRegions()
    const varyApproveViewPage = varyApproveAllRegions.selectCase()
    const varyApproveConfirmPage = varyApproveViewPage.clickApproveVariation()
    varyApproveCasesPage = varyApproveConfirmPage.clickBackToCaseList()
    varyApproveCasesPage.signOut().click()
  })

  it('ACO reject a licence variation', () => {
    cy.task('stubReferVariation')
    const indexPage = Page.verifyOnPage(IndexPage)
    let varyApproveCasesPage = indexPage.clickApproveAVariation()
    const varyApproveViewPage = varyApproveCasesPage.selectCase()
    const varyReferPage = varyApproveViewPage.clickReferVariation()
    const varyReferConfirmPage = varyReferPage
      .enterReasonForReferral('This case requires more restrictive conditions on movement please')
      .clickConfirmReferral()
    varyApproveCasesPage = varyReferConfirmPage.clickBackToCaseList()
    varyApproveCasesPage.signOut().click()
  })
})
