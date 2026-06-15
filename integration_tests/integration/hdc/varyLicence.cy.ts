import Page from '../../pages/page'
import IndexPage from '../../pages'
import LicenceStatus from '../../../server/enumeration/licenceStatus'
import LicenceCreationType from '../../../server/enumeration/licenceCreationType'

context('Vary a HDC licence', () => {
  const dates: string[] = []

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubProbationSignIn')
    cy.task('stubGetStaffDetails')
    cy.task('stubGetLicencesForOffender', { nomisId: 'G9786GC', kind: 'HDC', status: 'ACTIVE' })
    cy.task('stubGetCompletedLicence', { statusCode: 'ACTIVE', typeCode: 'AP', kind: 'HDC' })
    cy.task('stubGetStaffVaryCaseloadWithLao', {
      licenceId: 1,
      licenceStatus: LicenceStatus.ACTIVE,
      licenceCreationType: LicenceCreationType.LICENCE_NOT_STARTED,
    })
    cy.task('stubRecordAuditEvent')
    cy.task('stubMatchLicenceEvents')
    cy.task('stubGetLicencePolicyConditions')
    cy.task('stubGetActivePolicyConditions')
    cy.task('stubGetPolicyChanges')
    cy.task('stubFeComponents')
    cy.task('stubUpdatePolicy')
    cy.task('stubGetBankHolidays', dates)
    cy.task('stubDeleteAdditionalConditionsByCode')
    cy.task('stubCheckComCaseAccess')
    cy.task('stubGetHdcLicenceData')
    cy.signIn()
  })

  it('should click through vary a HDC licence journey', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    const varyCasesPage = indexPage.clickVaryALicence()
    varyCasesPage.getValue(varyCasesPage.myCount).should('contain.text', '1')
    varyCasesPage.getValue(varyCasesPage.teamCount).should('contain.text', '5')
    const timelinePage = varyCasesPage.selectCase()
    const viewActiveLicencePage = timelinePage.checkTimelineContent().selectVary()
    viewActiveLicencePage.getHdcCurfewDetailsHeading().should('contain.text', 'HDC curfew details')
    viewActiveLicencePage.getHdcAdSection().should('not.exist')
    viewActiveLicencePage.getCurfewAddressSection().should('exist')
    viewActiveLicencePage.getFirstNightCurfewTimesSection().should('not.exist')
    viewActiveLicencePage.getAllCurfewTimesEqualSection().should('exist')
    const confirmVaryPage = viewActiveLicencePage.selectVary()
    const spoDiscussionPage = confirmVaryPage.selectYes().clickContinue()
    const vloDiscussionPage = spoDiscussionPage.selectYes().clickContinue()
    const checkAnswersPage = vloDiscussionPage.selectYes().clickContinue()
    const reasonForVariationPage = checkAnswersPage.clickAddVariationNotes()
    reasonForVariationPage.verifyGuidanceText()
    viewActiveLicencePage.signOut().click()
  })
})
