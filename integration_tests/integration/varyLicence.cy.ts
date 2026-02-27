import Page from '../pages/page'
import IndexPage from '../pages'
import LicenceStatus from '../../server/enumeration/licenceStatus'
import LicenceCreationType from '../../server/enumeration/licenceCreationType'

context('Vary a licence', () => {
  const dates: string[] = []

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubProbationSignIn')
    cy.task('stubGetStaffDetails')
    cy.task('stubGetLicencesForOffender', { nomisId: 'G9786GC', kind: 'VARIATION', status: 'ACTIVE' })
    cy.task('stubGetCompletedLicence', { statusCode: 'ACTIVE', typeCode: 'AP_PSS' })
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
    cy.task('stubUpdateStandardConditions')
    cy.task('stubFeComponents')
    cy.task('stubGetBankHolidays', dates)
    cy.task('stubDeleteAdditionalConditionsByCode')
    cy.task('stubCheckComCaseAccess')
    cy.signIn()
  })

  it('should click through the vary a licence journey', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    const varyCasesPage = indexPage.clickVaryALicence()
    varyCasesPage.getValue(varyCasesPage.myCount).should('contain.text', '1')
    varyCasesPage.getValue(varyCasesPage.teamCount).should('contain.text', '5')
    const timelinePage = varyCasesPage.selectCase()
    const viewActiveLicencePage = timelinePage.checkTimelineContent().selectVary()
    const confirmVaryPage = viewActiveLicencePage.selectVary()
    const spoDiscussionPage = confirmVaryPage.selectYes().clickContinue()
    const vloDiscussionPage = spoDiscussionPage.selectYes().clickContinue()
    const checkAnswersPage = vloDiscussionPage.selectYes().clickContinue()
    const reasonForVariationPage = checkAnswersPage.clickAddVariationNotes()
    const variationSummaryPage = reasonForVariationPage
      .enterReason('In December Mr Person failed a drug test at Drug Rehab Clinic and tested positive for cocaine.')
      .clickContinue()
    const confirmationPage = variationSummaryPage.clickSendForApproval()

    confirmationPage.signOut().click()
  })

  it('LAO entry should render with correct links', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    const varyCasesPage = indexPage.clickVaryALicence()
    varyCasesPage.getRow(1).within(() => {
      cy.get('#name-2 .caseload-offender-name a').should('exist')
      cy.get('#name-2 .caseload-offender-name').should('contain', 'Access Restricted in NDelius')
      cy.get('#licence-type-2').should('contain', 'Restricted')
      cy.get('#probation-practitioner-2 a').should('not.exist')
      cy.get('#probation-practitioner-2').should('contain', 'Restricted')
      cy.get('#release-date-2').should('contain', 'Restricted')
    })
  })

  it('should click through the inflight licence vary journey, where the licence is not on the active policy version', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    const varyCasesPage = indexPage.clickVaryALicence()
    const timelinePage = varyCasesPage.selectCase()
    const viewActiveLicencePage = timelinePage.checkTimelineContent().selectVary()
    const confirmVaryPage = viewActiveLicencePage.selectVary()
    const spoDiscussionPage = confirmVaryPage.selectYes().clickContinue()
    const vloDiscussionPage = spoDiscussionPage.selectYes().clickContinue()
    const policyChangesPage = vloDiscussionPage.selectYes().clickContinuePolicyChanges()

    const checkAnswersPage = policyChangesPage
      .clickNextChange()
      .clickNextChangeNoReplacement()
      .selectRadio('yes')
      .clickContinue()
      .clickNextChangeNoReplacement()
      .selectRadio('yes')
      .clickContinue()
      .clickNextInput(false) // Hidden fields cause Axe to fail
      .selectRadio('Name of approved premises')
      .enterText('The Approved Premises', 'approvedPremises')
      .selectRadio('Daily')
      .selectRadio('Once a day')
      .enterTime('9', '30', 'reportingTime')
      .selectRadio('Monthly')
      .clickNextChange()
      .clickNextInput()
      .clickContinueFromVary()

    const reasonForVariationPage = checkAnswersPage.clickAddVariationNotes()
    const variationSummaryPage = reasonForVariationPage
      .enterReason('In December Mr Person failed a drug test at Drug Rehab Clinic and tested positive for cocaine.')
      .clickContinue()
    const confirmationPage = variationSummaryPage.clickSendForApproval()

    confirmationPage.signOut().click()
  })

  it('should redirect to the new condition delete page when the button is clicked from the inflight variation journey', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    const varyCasesPage = indexPage.clickVaryALicence()
    const timelinePage = varyCasesPage.selectCase()
    const viewActiveLicencePage = timelinePage.checkTimelineContent().selectVary()
    const confirmVaryPage = viewActiveLicencePage.selectVary()
    const spoDiscussionPage = confirmVaryPage.selectYes().clickContinue()
    const vloDiscussionPage = spoDiscussionPage.selectYes().clickContinue()
    const policyChangesPage = vloDiscussionPage.selectYes().clickContinuePolicyChanges()

    const checkAnswersPage = policyChangesPage
      .clickNextChange()
      .clickNextChangeNoReplacement()
      .selectRadio('yes')
      .clickContinue()
      .clickNextChangeNoReplacement()
      .selectRadio('yes')
      .clickContinue()
      .clickDeleteCondition()
      .selectRadio('no')
      .clickContinue()
      .clickDeleteCondition()
      .selectRadio('yes')
      .clickContinue()
      .clickNextInput()
      .clickContinueFromVary()

    const reasonForVariationPage = checkAnswersPage.clickAddVariationNotes()
    const variationSummaryPage = reasonForVariationPage
      .enterReason('In December Mr Person failed a drug test at Drug Rehab Clinic and tested positive for cocaine.')
      .clickContinue()
    const confirmationPage = variationSummaryPage.clickSendForApproval()

    confirmationPage.signOut().click()
  })

  it('should discard a licence variation', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    const varyCasesPage = indexPage.clickVaryALicence()
    const timelinePage = varyCasesPage.selectCase()
    const viewActiveLicencePage = timelinePage.selectVary()
    const confirmVaryPage = viewActiveLicencePage.selectVary()
    const spoDiscussionPage = confirmVaryPage.selectYes().clickContinue()
    const vloDiscussionPage = spoDiscussionPage.selectYes().clickContinue()
    const checkAnswersPage = vloDiscussionPage.selectYes().clickContinue()
    const discardPage = checkAnswersPage.clickDiscard()
    const caseloadPage = discardPage.selectYes().clickContinue()

    caseloadPage.signOut().click()
  })
})
