import Page from '../pages/page'
import IndexPage from '../pages'
import VaryApproveCasesPage from '../pages/varyApproveCasesPage'

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
    cy.task('stubCheckComCaseAccess')
    cy.task('stubGetCaseAccessDetails')
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

  it('should order cases by ascending variation request date', () => {
    cy.task('stubApproveVariation')
    const indexPage = Page.verifyOnPage(IndexPage)
    const varyApproveCasesPage = indexPage.clickApproveAVariation()
    varyApproveCasesPage.getVariationRequestDate(0).contains('28 Feb 2021')
    varyApproveCasesPage.getVariationRequestDate(1).contains('1 Mar 2021')
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

  it('ACO cannot see LAO cases if they are restricted', () => {
    cy.task('stubApproveVariation')
    const indexPage = Page.verifyOnPage(IndexPage)
    let varyApproveCasesPage = indexPage.clickApproveAVariation()
    varyApproveCasesPage.getRow(2).within(() => {
      cy.get('#name-3 .caseload-offender-name a').should('exist')
      cy.get('#name-3 .caseload-offender-name').should('contain', 'Access Restricted in NDelius')
      cy.get('#licence-type-3').should('contain', 'Restricted')
      cy.get('#probation-practitioner-3 a').should('not.exist')
      cy.get('#probation-practitioner-3').should('contain', 'Restricted')
      cy.get('#release-date-3').should('contain', 'Restricted')
      cy.get('#variation-request-date-3').should('contain', 'Restricted')
    })
    const restrictedDetailsPage = varyApproveCasesPage.clickRestrictedOffenderName()
    restrictedDetailsPage
      .getRestrictedDetails()
      .contains('This record has been restricted due to sensitive information')
    varyApproveCasesPage = restrictedDetailsPage.clickBack(VaryApproveCasesPage)
    const varyApproveViewPage = varyApproveCasesPage.selectCase()
    const varyApproveConfirmPage = varyApproveViewPage.clickApproveVariation()
    varyApproveCasesPage = varyApproveConfirmPage.clickBackToCaseList()
    varyApproveCasesPage.signOut().click()
  })
})
