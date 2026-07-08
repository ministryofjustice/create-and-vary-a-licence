import Page from '../../pages/page'
import IndexPage from '../../pages'
import LicenceKind from '../../../server/enumeration/LicenceKind'

context('ACO review a HDC licence variation', () => {
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
    cy.task('stubGetHdcLicence', {
      statusCode: 'VARIATION_SUBMITTED',
      typeCode: 'AP',
      kind: 'HDC_VARIATION',
      curfewAddress,
      variationOf: '120',
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

  it('ACO approve a HDC licence variation', () => {
    cy.task('stubApproveVariation')
    cy.task('stubGetHdcLicence', {
      licenceId: '120',
      licenceKind: LicenceKind.HDC,
      curfewAddress: { ...curfewAddress, secondLine: 'Apt 5' },
      weeklyCurfewTimes: [
        {
          curfewTimesSequence: 0,
          fromTime: '20:00:00',
          untilTime: '06:00:00',
        },
      ],
    })
    const indexPage = Page.verifyOnPage(IndexPage)
    let varyApproveCasesPage = indexPage.clickApproveAVariation()
    const varyApproveViewPage = varyApproveCasesPage.selectCase()
    varyApproveViewPage.checkResidentialChecksNotCompleted('Reason for incomplete checks')
    varyApproveViewPage.checkHdcCurfewDetails('123 Fake Street, Apt 4, Fakecounty, FK1 2AB', true)
    const varyApproveConfirmPage = varyApproveViewPage.clickApproveVariation()
    varyApproveCasesPage = varyApproveConfirmPage.clickBackToCaseList()
    varyApproveCasesPage.signOut().click()
  })

  it('ACO reject a HDC licence variation', () => {
    cy.task('stubReferVariation')
    cy.task('stubGetHdcLicence', {
      licenceId: '120',
      licenceKind: LicenceKind.HDC,
      curfewAddress: { ...curfewAddress, secondLine: 'Apt 5' },
      weeklyCurfewTimes: [
        {
          curfewTimesSequence: 0,
          fromTime: '20:00:00',
          untilTime: '06:00:00',
        },
      ],
    })
    const indexPage = Page.verifyOnPage(IndexPage)
    let varyApproveCasesPage = indexPage.clickApproveAVariation()
    const varyApproveViewPage = varyApproveCasesPage.selectCase()
    const varyReferPage = varyApproveViewPage.clickReferVariation()
    const varyReferConfirmPage = varyReferPage
      .enterReasonForReferral('This case requires more restrictive conditions on movement please')
      .expandVariationDetails()
      .checkHdcCurfewDetails('123 Fake Street, Apt 4, Fakecounty, FK1 2AB', true)
      .clickConfirmReferral()
    varyApproveCasesPage = varyReferConfirmPage.clickBackToCaseList()
    varyApproveCasesPage.signOut().click()
  })
})
