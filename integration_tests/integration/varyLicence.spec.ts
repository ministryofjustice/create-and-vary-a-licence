import Page from '../pages/page'
import IndexPage from '../pages'

context('Vary a licence', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubProbationSignIn')
    cy.task('stubGetStaffDetails')
    cy.task('stubGetManagedOffenders')
    cy.task('stubGetOffendersByCrn')
    cy.task('stubGetLicencesForOffender', { nomisId: 'G9786GC', status: 'ACTIVE' })
    cy.task('stubGetCompletedLicence', 'ACTIVE')
    cy.task('stubGetOffendersByNomsNumber')
    cy.task('searchPrisonersByNomisIds')
    cy.task('stubGetStaffDetailsByList')
    cy.task('stubRecordAuditEvent')
    cy.task('stubMatchLicenceEvents')
    cy.signIn()
  })

  it('should click through the vary a licence journey', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    const varyCasesPage = indexPage.clickVaryALicence()
    const varyViewPage = varyCasesPage.selectCase()
    const confirmVaryPage = varyViewPage.selectVary()
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

  it('should discard a licence variation', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    const varyCasesPage = indexPage.clickVaryALicence()
    const varyViewPage = varyCasesPage.selectCase()
    const confirmVaryPage = varyViewPage.selectVary()
    const spoDiscussionPage = confirmVaryPage.selectYes().clickContinue()
    const vloDiscussionPage = spoDiscussionPage.selectYes().clickContinue()
    const checkAnswersPage = vloDiscussionPage.selectYes().clickContinue()
    const discardPage = checkAnswersPage.clickDiscard()
    const caseloadPage = discardPage.selectYes().clickContinue()

    caseloadPage.signOut().click()
  })
})
