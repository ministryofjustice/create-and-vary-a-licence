import Page from '../pages/page'
import IndexPage from '../pages'
import CheckAnswersPage from '../pages/checkAnswers'
import PathfinderDetailsQuestionPage from '../pages/PathfinderDetailsQuestionPage'

context('Create a licence that needs pathfinder or programme question', () => {
  const dates: string[] = []

  // Sets up the caseload stubs the journey relies on, then lets tests jump straight to the page under test
  const stubCaseload = () => Page.verifyOnPage(IndexPage).clickCreateALicence()

  const visitCheckAnswers = (status: 'NOT_NEEDED' | 'NOT_STARTED' | 'COMPLETE', provider?: object) => {
    stubCaseload()
    cy.task('stubAll', [
      'stubPutAdditionalConditionData',
      'stubPutBespokeConditions',
      [
        'stubGetCompletedLicence',
        {
          statusCode: 'IN_PROGRESS',
          typeCode: 'AP',
          kind: 'CRD',
          electronicMonitoringProvider: provider,
          electronicMonitoringProviderStatus: status,
          appointmentTelephoneNumber: '01234567890',
          appointmentAlternativeTelephoneNumber: '09876543210',
        },
      ],
    ])
    cy.visit('/licence/create/id/1/check-your-answers')
    return Page.verifyOnPage(CheckAnswersPage)
  }

  const visitPathfinderQuestion = () => {
    stubCaseload()
    cy.task('stubGetLicence', { electronicMonitoringProviderStatus: 'NOT_STARTED' })
    cy.visit('/licence/create/id/1/add-pathfinder')
    return Page.verifyOnPage(PathfinderDetailsQuestionPage)
  }

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubAll', [
      'stubProbationSignIn',
      'stubGetStaffDetails',
      ['stubGetLicence', {}],
      'stubGetOmuEmail',
      'stubSearchForAddresses',
      'stubGetStaffPreferredAddresses',
      'stubPutLicenceAppointmentPerson',
      'stubRecordAuditEvent',
      'stubGetLicencePolicyConditions',
      'stubGetActivePolicyConditions',
      ['stubGetBankHolidays', dates],
      'stubAddAdditionalCondition',
      'stubDeleteAdditionalConditionsByCode',
      'stubPostProbationLicence',
      'stubCheckComCaseAccess',
    ])
    cy.signIn()
  })

  it('should throw an error if the licence is submitted with out answering the pathfinder or programme question', () => {
    const checkAnswersPage = visitCheckAnswers('NOT_STARTED', { isToBeTaggedForProgramme: null, programmeName: '' })
    checkAnswersPage.checkIfElectronicMonitoringProviderExists()
    checkAnswersPage.clickSubmitLicenceWithErrors().getErrorSummary().should('exist')
  })

  it('should not throw error if the licence is submitted with answering the pathfinder or programme question', () => {
    const checkAnswersPage = visitCheckAnswers('COMPLETE', {
      isToBeTaggedForProgramme: true,
      programmeName: 'Test Programme',
    })
    checkAnswersPage.checkIfElectronicMonitoringProviderExists()

    const confirmationPage = checkAnswersPage.clickSendLicenceConditionsToPrison()
    const caseloadPageExit = confirmationPage.clickReturn()
    caseloadPageExit.signOut().click()
  })

  it('should not load electronic monitoring provider section when electronicMonitoringProviderStatus is NOT_NEEDED', () => {
    visitCheckAnswers('NOT_NEEDED').checkIfElectronicMonitoringProviderDoesNotExist()
  })

  it('should load electronic monitoring provider section if electronicMonitoringProviderStaus is NOT_STARTED', () => {
    visitCheckAnswers('NOT_STARTED').checkIfElectronicMonitoringProviderExists()
  })

  it('should load electronic monitoring provider section if electronicMonitoringProviderStaus is COMPLETE and licence not approved in time', () => {
    cy.task('stubGetCaseloadItemInHardStop')
    cy.task('stubGetOmuEmail')
    cy.task('stubGetPreviouslyApprovedAndTimedOutLicencesCaseload')
    cy.task('stubGetApprovedLicenceInHardStop')
    const indexPage = Page.verifyOnPage(IndexPage)
    const caseloadPage = indexPage.clickCreateALicenceInHardStop()
    const checkAnswersPage = caseloadPage.clickNameOfTimedOutEdit()
    checkAnswersPage.checkIfElectronicMonitoringProviderExists()
  })

  it("should throw an error if neither 'Yes' nor 'No' is selected", () => {
    visitPathfinderQuestion().clickContinueWithError().getErrorSummary().should('exist')
  })

  it("should throw an error if 'Yes' is selected and pathfinder/programme name is not provided", () => {
    visitPathfinderQuestion().selectYes().clickContinueWithError().getErrorSummary().should('exist')
  })

  it("should continue licence creation flow if 'Yes' is selected and pathfinder/programme name is provided", () => {
    const bespokeConditionsQuestionPage = visitPathfinderQuestion()
      .selectYes()
      .enterProgrammeName('Test Pathfinder Programme')
      .clickContinue()

    const bespokeConditionsPage = bespokeConditionsQuestionPage.selectYes().clickContinue()
    const checkAnswersPage = bespokeConditionsPage
      .enterBespokeCondition(0, 'An unusual bespoke condition to be approved.')
      .checkDeleteThisCondition() // for single Bespoke Condition
      .clickAddAnother()
      .enterBespokeCondition(1, 'Another unusual and unlikely bespoke condition')
      .checkDeleteTheseConditions() // for multiple Bespoke Condition
      .clickAddAnother()
      .enterBespokeCondition(2, 'A final third bespoke condition')
      .checkDeleteTheseConditions() // for multiple Bespoke Condition
      .clickContinue()

    const confirmationPage = checkAnswersPage.clickSendLicenceConditionsToPrison()
    const caseloadPageExit = confirmationPage.clickReturn()
    caseloadPageExit.signOut().click()
  })

  it("should continue licence creation flow if 'No' is selected", () => {
    visitPathfinderQuestion().selectNo().clickContinue()
  })
})
