import Page from '../pages/page'
import IndexPage from '../pages'

context('Vary a licence', () => {
  const dates: string[] = []

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubProbationSignIn')
    cy.task('stubGetStaffDetails')
    cy.task('stubGetManagedOffenders')
    cy.task('stubGetOffendersByCrn')
    cy.task('stubGetLicencesForOffender', { nomisId: 'G9786GC', kind: 'VARIATION', status: 'ACTIVE' })
    cy.task('stubGetCompletedLicence', { statusCode: 'ACTIVE', typeCode: 'AP_PSS' })
    cy.task('stubGetOffendersByNomsNumber')
    cy.task('searchPrisonersByNomisIds')
    cy.task('stubGetStaffDetailsByList')
    cy.task('stubRecordAuditEvent')
    cy.task('stubMatchLicenceEvents')
    cy.task('stubGetLicencePolicyConditions')
    cy.task('stubGetActivePolicyConditions')
    cy.task('stubGetPolicyChanges')
    cy.task('stubUpdateStandardConditions')
    cy.task('stubFeComponents')
    cy.task('stubGetBankHolidays', dates)
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
      .enterReason('In December Mr Zimmer failed a drug test at Drug Rehab Clinic and tested positive for cocaine.')
      .clickContinue()
    const confirmationPage = variationSummaryPage.clickSendForApproval()

    confirmationPage.signOut().click()
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
      .clickNextChange()
      .clickNextChange()
      .clickNextInput(false) // Hidden fields cause Axe to fail
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
      .enterReason('In December Mr Zimmer failed a drug test at Drug Rehab Clinic and tested positive for cocaine.')
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
      .clickNextChange()
      .clickNextChange()
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
      .enterReason('In December Mr Zimmer failed a drug test at Drug Rehab Clinic and tested positive for cocaine.')
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
