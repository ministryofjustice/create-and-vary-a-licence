import moment from 'moment'
import Page from '../pages/page'
import IndexPage from '../pages'

context('Create a licence that needs pathfinder or programme question', () => {
  const dates: string[] = []

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubProbationSignIn')
    cy.task('stubGetStaffDetails')
    cy.task('stubGetLicence')
    cy.task('stubUpdateStandardConditions')
    cy.task('stubRecordAuditEvent')
    cy.task('stubGetLicencePolicyConditions')
    cy.task('stubGetActivePolicyConditions')
    cy.task('stubGetBankHolidays', dates)
    cy.task('stubAddAdditionalCondition')
    cy.task('stubDeleteAdditionalConditionsByCode')
    cy.task('stubFeComponents')
    cy.signIn()
  })

  it('should throw an error if the licence is submitted with out answering the pathfinder or programme question', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    let caseloadPage = indexPage.clickCreateALicence()
    const comDetailsPage = caseloadPage.clickComName()
    caseloadPage = comDetailsPage.clickReturnToCaseload()
    const confirmCreatePage = caseloadPage.clickNameToCreateLicence()

    const appointmentPersonPage = confirmCreatePage.selectYes().clickContinue()
    const appointmentPlacePage = appointmentPersonPage.enterPerson('Duty Officer').clickContinue()
    const appointmentContactPage = appointmentPlacePage
      .enterAddressLine1('123 Fake Street')
      .enterTown('Fakestown')
      .enterCounty('Fakeshire')
      .enterPostcode('FA11KE')
      .clickContinue()

    const appointmentTimePage = appointmentContactPage.enterTelephone('00000000000').clickContinue()

    cy.task('getNextWorkingDay', dates).then(appointmentDate => {
      const additionalConditionsPage = appointmentTimePage
        .selectType('SPECIFIC_DATE_TIME')
        .enterDate(moment(appointmentDate))
        .enterTime(moment())
        .clickContinue()
        .selectYes()
        .clickContinue()

      const additionalConditionsInputPage = additionalConditionsPage
        .selectCondition('5db26ab3-9b6f-4bee-b2aa-53aa3f3be7dd')
        .selectCondition('fce34fb2-02f4-4eb0-9b8d-d091e11451fa')
        .selectCondition('df3f08a8-4ae0-41fe-b3bc-d0be1fd2d8aa')
        .selectCondition('0a370862-5426-49c1-b6d4-3d074d78a81a')
        .selectCondition('3932e5c9-4d21-4251-a747-ce6dc52dc9c0')
        .clickContinue()

      const bespokeConditionsQuestionPage = additionalConditionsInputPage
        .withContext(additionalConditionsPage.getContext())
        .selectRadio('London')
        .nextCondition()
        .selectRadio()
        .nextCondition()
        .checkBoxes()
        .nextCondition(false) // aria-expanded attribute causes issues with Axe
        .selectRadio('Two curfews')
        .addFirstCurfew(2)
        .addSecondCurfew(2)
        .selectRadio('Other')
        .enterText('Annually', 'alternativeReviewPeriod')
        .nextCondition()
        .enterText('Knives', 'item[0]')
        .clickAddAnother()
        .enterText('Needles', 'item[1]')
        .clickContinue()

      const bespokeConditionsPage = bespokeConditionsQuestionPage.selectYes().clickContinue()

      const pssConditionsQuestionPage = bespokeConditionsPage
        .enterBespokeCondition(0, 'An unusual bespoke condition to be approved.')
        .checkDeleteThisCondition() // for single Bespoke Condition
        .clickAddAnother()
        .enterBespokeCondition(1, 'Another unusual and unlikely bespoke condition')
        .checkDeleteTheseConditions() // for multiple Bespoke Condition
        .clickAddAnother()
        .enterBespokeCondition(2, 'A final third bespoke condition')
        .checkDeleteTheseConditions() // for multiple Bespoke Condition
        .clickContinue()

      const pssConditionsPage = pssConditionsQuestionPage.selectYes().clickContinue()

      const pssConditionsInputPage = pssConditionsPage
        .selectCondition('62c83b80-2223-4562-a195-0670f4072088')
        .selectCondition('fda24aa9-a2b0-4d49-9c87-23b0a7be4013')
        .clickContinue()

      const checkAnswersPage = pssConditionsInputPage
        .withContext(pssConditionsPage.getContext())
        .enterTime()
        .enterDate()
        .enterAddress()
        .nextInput()
        .enterAddress()
        .clickContinue(
          {
            isToBeTaggedForProgramme: null,
            programmeName: '',
          },
          'NOT_STARTED',
        )
      checkAnswersPage.checkIfElectronicMonitoringProviderExists()
      checkAnswersPage.clickSubmitLicenceWithErrors().getErrorSummary().should('exist')
    })
  })

  it('should not throw error if the licence is submitted with answering the pathfinder or programme question', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    let caseloadPage = indexPage.clickCreateALicence()
    const comDetailsPage = caseloadPage.clickComName()
    caseloadPage = comDetailsPage.clickReturnToCaseload()
    const confirmCreatePage = caseloadPage.clickNameToCreateLicence()

    const appointmentPersonPage = confirmCreatePage.selectYes().clickContinue()
    const appointmentPlacePage = appointmentPersonPage.enterPerson('Duty Officer').clickContinue()
    const appointmentContactPage = appointmentPlacePage
      .enterAddressLine1('123 Fake Street')
      .enterTown('Fakestown')
      .enterCounty('Fakeshire')
      .enterPostcode('FA11KE')
      .clickContinue()

    const appointmentTimePage = appointmentContactPage.enterTelephone('00000000000').clickContinue()

    cy.task('getNextWorkingDay', dates).then(appointmentDate => {
      const additionalConditionsPage = appointmentTimePage
        .selectType('SPECIFIC_DATE_TIME')
        .enterDate(moment(appointmentDate))
        .enterTime(moment())
        .clickContinue()
        .selectYes()
        .clickContinue()

      const additionalConditionsInputPage = additionalConditionsPage
        .selectCondition('5db26ab3-9b6f-4bee-b2aa-53aa3f3be7dd')
        .selectCondition('fce34fb2-02f4-4eb0-9b8d-d091e11451fa')
        .selectCondition('df3f08a8-4ae0-41fe-b3bc-d0be1fd2d8aa')
        .selectCondition('0a370862-5426-49c1-b6d4-3d074d78a81a')
        .selectCondition('3932e5c9-4d21-4251-a747-ce6dc52dc9c0')
        .clickContinue()

      const bespokeConditionsQuestionPage = additionalConditionsInputPage
        .withContext(additionalConditionsPage.getContext())
        .selectRadio('London')
        .nextCondition()
        .selectRadio()
        .nextCondition()
        .checkBoxes()
        .nextCondition(false) // aria-expanded attribute causes issues with Axe
        .selectRadio('Two curfews')
        .addFirstCurfew(2)
        .addSecondCurfew(2)
        .selectRadio('Other')
        .enterText('Annually', 'alternativeReviewPeriod')
        .nextCondition()
        .enterText('Knives', 'item[0]')
        .clickAddAnother()
        .enterText('Needles', 'item[1]')
        .clickContinue()

      const bespokeConditionsPage = bespokeConditionsQuestionPage.selectYes().clickContinue()

      const pssConditionsQuestionPage = bespokeConditionsPage
        .enterBespokeCondition(0, 'An unusual bespoke condition to be approved.')
        .checkDeleteThisCondition() // for single Bespoke Condition
        .clickAddAnother()
        .enterBespokeCondition(1, 'Another unusual and unlikely bespoke condition')
        .checkDeleteTheseConditions() // for multiple Bespoke Condition
        .clickAddAnother()
        .enterBespokeCondition(2, 'A final third bespoke condition')
        .checkDeleteTheseConditions() // for multiple Bespoke Condition
        .clickContinue()

      const pssConditionsPage = pssConditionsQuestionPage.selectYes().clickContinue()

      const pssConditionsInputPage = pssConditionsPage
        .selectCondition('62c83b80-2223-4562-a195-0670f4072088')
        .selectCondition('fda24aa9-a2b0-4d49-9c87-23b0a7be4013')
        .clickContinue()

      const checkAnswersPage = pssConditionsInputPage
        .withContext(pssConditionsPage.getContext())
        .enterTime()
        .enterDate()
        .enterAddress()
        .nextInput()
        .enterAddress()
        .clickContinue(
          {
            isToBeTaggedForProgramme: true,
            programmeName: 'Test Programme',
          },
          'COMPLETE',
        )
      checkAnswersPage.checkIfElectronicMonitoringProviderExists()

      const confirmationPage = checkAnswersPage.clickSendLicenceConditionsToPrison()
      const caseloadPageExit = confirmationPage.clickReturn()
      caseloadPageExit.signOut().click()
    })
  })

  it('should not load electronic monitoring provider section when electronicMonitoringProviderStatus is NOT_NEEDED', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    let caseloadPage = indexPage.clickCreateALicence()
    const comDetailsPage = caseloadPage.clickComName()
    caseloadPage = comDetailsPage.clickReturnToCaseload()
    const confirmCreatePage = caseloadPage.clickNameToCreateLicence()

    const appointmentPersonPage = confirmCreatePage.selectYes().clickContinue()
    const appointmentPlacePage = appointmentPersonPage.enterPerson('Duty Officer').clickContinue()
    const appointmentContactPage = appointmentPlacePage
      .enterAddressLine1('123 Fake Street')
      .enterTown('Fakestown')
      .enterCounty('Fakeshire')
      .enterPostcode('FA11KE')
      .clickContinue()

    const appointmentTimePage = appointmentContactPage.enterTelephone('00000000000').clickContinue()

    cy.task('getNextWorkingDay', dates).then(appointmentDate => {
      const additionalConditionsPage = appointmentTimePage
        .selectType('SPECIFIC_DATE_TIME')
        .enterDate(moment(appointmentDate))
        .enterTime(moment())
        .clickContinue()
        .selectYes()
        .clickContinue()

      const additionalConditionsInputPage = additionalConditionsPage
        .selectCondition('5db26ab3-9b6f-4bee-b2aa-53aa3f3be7dd')
        .selectCondition('fce34fb2-02f4-4eb0-9b8d-d091e11451fa')
        .selectCondition('df3f08a8-4ae0-41fe-b3bc-d0be1fd2d8aa')
        .selectCondition('0a370862-5426-49c1-b6d4-3d074d78a81a')
        .selectCondition('3932e5c9-4d21-4251-a747-ce6dc52dc9c0')
        .clickContinue()

      const bespokeConditionsQuestionPage = additionalConditionsInputPage
        .withContext(additionalConditionsPage.getContext())
        .selectRadio('London')
        .nextCondition()
        .selectRadio()
        .nextCondition()
        .checkBoxes()
        .nextCondition(false) // aria-expanded attribute causes issues with Axe
        .selectRadio('Two curfews')
        .addFirstCurfew(2)
        .addSecondCurfew(2)
        .selectRadio('Other')
        .enterText('Annually', 'alternativeReviewPeriod')
        .nextCondition()
        .enterText('Knives', 'item[0]')
        .clickAddAnother()
        .enterText('Needles', 'item[1]')
        .clickContinue()

      const bespokeConditionsPage = bespokeConditionsQuestionPage.selectYes().clickContinue()

      const pssConditionsQuestionPage = bespokeConditionsPage
        .enterBespokeCondition(0, 'An unusual bespoke condition to be approved.')
        .checkDeleteThisCondition() // for single Bespoke Condition
        .clickAddAnother()
        .enterBespokeCondition(1, 'Another unusual and unlikely bespoke condition')
        .checkDeleteTheseConditions() // for multiple Bespoke Condition
        .clickAddAnother()
        .enterBespokeCondition(2, 'A final third bespoke condition')
        .checkDeleteTheseConditions() // for multiple Bespoke Condition
        .clickContinue()

      const pssConditionsPage = pssConditionsQuestionPage.selectYes().clickContinue()

      const pssConditionsInputPage = pssConditionsPage
        .selectCondition('62c83b80-2223-4562-a195-0670f4072088')
        .selectCondition('fda24aa9-a2b0-4d49-9c87-23b0a7be4013')
        .clickContinue()

      const checkAnswersPage = pssConditionsInputPage
        .withContext(pssConditionsPage.getContext())
        .enterTime()
        .enterDate()
        .enterAddress()
        .nextInput()
        .enterAddress()
        .clickContinue()
      checkAnswersPage.checkIfElectronicMonitoringProviderDoesNotExist()
    })
  })

  it('should load electronic monitoring provider section if electronicMonitoringProviderStaus is NOT_STARTED', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    let caseloadPage = indexPage.clickCreateALicence()
    const comDetailsPage = caseloadPage.clickComName()
    caseloadPage = comDetailsPage.clickReturnToCaseload()
    const confirmCreatePage = caseloadPage.clickNameToCreateLicence()

    const appointmentPersonPage = confirmCreatePage.selectYes().clickContinue()
    const appointmentPlacePage = appointmentPersonPage.enterPerson('Duty Officer').clickContinue()
    const appointmentContactPage = appointmentPlacePage
      .enterAddressLine1('123 Fake Street')
      .enterTown('Fakestown')
      .enterCounty('Fakeshire')
      .enterPostcode('FA11KE')
      .clickContinue()

    const appointmentTimePage = appointmentContactPage.enterTelephone('00000000000').clickContinue()

    cy.task('getNextWorkingDay', dates).then(appointmentDate => {
      const additionalConditionsPage = appointmentTimePage
        .selectType('SPECIFIC_DATE_TIME')
        .enterDate(moment(appointmentDate))
        .enterTime(moment())
        .clickContinue()
        .selectYes()
        .clickContinue()

      const additionalConditionsInputPage = additionalConditionsPage
        .selectCondition('5db26ab3-9b6f-4bee-b2aa-53aa3f3be7dd')
        .selectCondition('fce34fb2-02f4-4eb0-9b8d-d091e11451fa')
        .selectCondition('df3f08a8-4ae0-41fe-b3bc-d0be1fd2d8aa')
        .selectCondition('0a370862-5426-49c1-b6d4-3d074d78a81a')
        .selectCondition('3932e5c9-4d21-4251-a747-ce6dc52dc9c0')
        .clickContinue()

      const bespokeConditionsQuestionPage = additionalConditionsInputPage
        .withContext(additionalConditionsPage.getContext())
        .selectRadio('London')
        .nextCondition()
        .selectRadio()
        .nextCondition()
        .checkBoxes()
        .nextCondition(false) // aria-expanded attribute causes issues with Axe
        .selectRadio('Two curfews')
        .addFirstCurfew(2)
        .addSecondCurfew(2)
        .selectRadio('Other')
        .enterText('Annually', 'alternativeReviewPeriod')
        .nextCondition()
        .enterText('Knives', 'item[0]')
        .clickAddAnother()
        .enterText('Needles', 'item[1]')
        .clickContinue()

      const bespokeConditionsPage = bespokeConditionsQuestionPage.selectYes().clickContinue()

      const pssConditionsQuestionPage = bespokeConditionsPage
        .enterBespokeCondition(0, 'An unusual bespoke condition to be approved.')
        .checkDeleteThisCondition() // for single Bespoke Condition
        .clickAddAnother()
        .enterBespokeCondition(1, 'Another unusual and unlikely bespoke condition')
        .checkDeleteTheseConditions() // for multiple Bespoke Condition
        .clickAddAnother()
        .enterBespokeCondition(2, 'A final third bespoke condition')
        .checkDeleteTheseConditions() // for multiple Bespoke Condition
        .clickContinue()

      const pssConditionsPage = pssConditionsQuestionPage.selectYes().clickContinue()

      const pssConditionsInputPage = pssConditionsPage
        .selectCondition('62c83b80-2223-4562-a195-0670f4072088')
        .selectCondition('fda24aa9-a2b0-4d49-9c87-23b0a7be4013')
        .clickContinue()

      const checkAnswersPage = pssConditionsInputPage
        .withContext(pssConditionsPage.getContext())
        .enterTime()
        .enterDate()
        .enterAddress()
        .nextInput()
        .enterAddress()
        .clickContinue(
          {
            isToBeTaggedForProgramme: null,
            programmeName: '',
          },
          'NOT_STARTED',
        )
      checkAnswersPage.checkIfElectronicMonitoringProviderExists()
    })
  })

  it('should load electronic monitoring provider section if electronicMonitoringProviderStaus is COMPLETE and licence not approved in time', () => {
    cy.task('stubGetCaseloadItemInHardStop')
    cy.task('stubGetStaffDetailsByList')
    cy.task('stubGetOmuEmail')
    cy.task('stubGetPreviouslyApprovedAndTimedOutLicencesCaseload')
    cy.task('stubGetApprovedLicenceInHardStop')
    const indexPage = Page.verifyOnPage(IndexPage)
    const caseloadPage = indexPage.clickCreateALicenceInHardStop()
    const checkAnswersPage = caseloadPage.clickNameOfTimedOutEdit()
    checkAnswersPage.checkIfElectronicMonitoringProviderExists()
  })
})
