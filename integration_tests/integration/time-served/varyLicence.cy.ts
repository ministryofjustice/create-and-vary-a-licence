import Page from '../../pages/page'
import IndexPage from '../../pages'
import LicenceStatus from '../../../server/enumeration/licenceStatus'
import { LicenceKind } from '../../../server/enumeration'

context('Vary a licence - time served', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubProbationSignIn')
    cy.task('stubGetStaffDetails')
    cy.task('stubMatchLicenceEvents')
    cy.task('stubGetStaffVaryCaseload', {
      licenceId: 1,
      licenceStatus: LicenceStatus.ACTIVE,
      isReviewNeeded: true,
      kind: LicenceKind.TIME_SERVED,
    })
    cy.task('stubGetCompletedLicence', {
      statusCode: LicenceStatus.ACTIVE,
      kind: LicenceKind.TIME_SERVED,
      isReviewNeeded: true,
    })
    cy.task('stubReviewWithOutVariation')
    cy.signIn()
  })

  afterEach(() => {
    cy.get('[data-qa=signOut]').click()
  })

  it('review without varying timeserved licence with com', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    const varyCasesPage = indexPage.clickVaryALicence()
    varyCasesPage.getUrgentHighlightMessage().should('contain', 'Time-served release')
    varyCasesPage.getLicenceStatusByIndex(1).should('contain', 'Review needed')
    const timelinePage = varyCasesPage.selectCase()
    timelinePage.checkThatPageHasTimeServedReviewNeededMessage()
    const reviewLicencQuestionPage = timelinePage.clickReviewLicenceButton()
    reviewLicencQuestionPage.selectNoToReviewWithOutVariation()
    reviewLicencQuestionPage.clickContinue()
  })

  it('review without varying timeserved licence with out com', () => {
    cy.task('stubGetStaffVaryCaseload', {
      licenceId: 1,
      licenceStatus: LicenceStatus.ACTIVE,
      isReviewNeeded: true,
      kind: LicenceKind.TIME_SERVED,
      isUnallocatedCom: true,
    })
    const indexPage = Page.verifyOnPage(IndexPage)
    const varyCasesPage = indexPage.clickVaryALicence()
    varyCasesPage.getUrgentHighlightMessage().should('contain', 'Time-served release')
    varyCasesPage.getLicenceStatusByIndex(1).should('contain', 'Review needed')
    const getProbationPractitioner = varyCasesPage.getProbationPractitioner(1)
    getProbationPractitioner.should('contain', 'Not allocated')
    const timelinePage = varyCasesPage.selectCase()
    timelinePage.checkThatPageHasTimeServedReviewNeededMessage()
    const reviewLicencQuestionPage = timelinePage.clickReviewLicenceButton()
    reviewLicencQuestionPage.selectNoToReviewWithOutVariation()
    reviewLicencQuestionPage.clickContinue()
  })

  it('vary timeserved licence with com', () => {
    cy.task('stubGetHardStopAndTimedOutLicences')
    cy.task('stubGetActivePolicyConditions')
    cy.task('stubRecordAuditEvent')
    const indexPage = Page.verifyOnPage(IndexPage)
    const varyCasesPage = indexPage.clickVaryALicence()
    varyCasesPage.getUrgentHighlightMessage().should('contain', 'Time-served release')
    varyCasesPage.getLicenceStatusByIndex(1).should('contain', 'Review needed')
    const timelinePage = varyCasesPage.selectCase()
    timelinePage.checkThatPageHasTimeServedReviewNeededMessage()
    const reviewLicencQuestionPage = timelinePage.clickReviewLicenceButton()
    reviewLicencQuestionPage.selectYesToVary()
    const spoDiscussionPage = reviewLicencQuestionPage.clickContinueToSpoPage()
    const vloDiscussionPage = spoDiscussionPage.selectYes().clickContinue()
    const checkAnswersPage = vloDiscussionPage.selectYes().clickContinue()
    const reasonForVariationPage = checkAnswersPage.clickAddVariationNotes()
    const variationSummaryPage = reasonForVariationPage
      .enterReason('In December Mr Person failed a drug test at Drug Rehab Clinic and tested positive for cocaine.')
      .clickContinue()
    const confirmationPage = variationSummaryPage.clickSendForApproval()
    confirmationPage
      .getApprovedMessage()
      .should(
        'contain',
        'We have sent the variation request to the head of the Probation Delivery Unit (PDU) for approval.',
      )
  })

  it('vary timeserved licence with out com', () => {
    cy.task('stubGetStaffVaryCaseload', {
      licenceId: 1,
      licenceStatus: LicenceStatus.ACTIVE,
      isReviewNeeded: true,
      kind: LicenceKind.TIME_SERVED,
      isUnallocatedCom: true,
    })
    cy.task('stubGetHardStopAndTimedOutLicences')
    cy.task('stubGetActivePolicyConditions')
    cy.task('stubRecordAuditEvent')
    const indexPage = Page.verifyOnPage(IndexPage)
    const varyCasesPage = indexPage.clickVaryALicence()
    varyCasesPage.getUrgentHighlightMessage().should('contain', 'Time-served release')
    varyCasesPage.getLicenceStatusByIndex(1).should('contain', 'Review needed')
    const getProbationPractitioner = varyCasesPage.getProbationPractitioner(1)
    getProbationPractitioner.should('contain', 'Not allocated')
    const timelinePage = varyCasesPage.selectCase()
    timelinePage.checkThatPageHasTimeServedReviewNeededMessage()
    const reviewLicencQuestionPage = timelinePage.clickReviewLicenceButton()
    reviewLicencQuestionPage.selectYesToVary()
    const spoDiscussionPage = reviewLicencQuestionPage.clickContinueToSpoPage()
    const vloDiscussionPage = spoDiscussionPage.selectYes().clickContinue()
    const checkAnswersPage = vloDiscussionPage.selectYes().clickContinue()
    const reasonForVariationPage = checkAnswersPage.clickAddVariationNotes()
    const variationSummaryPage = reasonForVariationPage
      .enterReason('In December Mr Person failed a drug test at Drug Rehab Clinic and tested positive for cocaine.')
      .clickContinue()
    const confirmationPage = variationSummaryPage.clickSendForApproval()
    confirmationPage
      .getApprovedMessage()
      .should(
        'contain',
        'We have sent the variation request to the head of the Probation Delivery Unit (PDU) for approval.',
      )
  })
})
