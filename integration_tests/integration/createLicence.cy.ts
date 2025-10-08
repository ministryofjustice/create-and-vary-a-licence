import moment from 'moment'
import Page from '../pages/page'
import IndexPage from '../pages'
import { licenceConditions } from '../mockApis/licence'
import { AdditionalCondition } from '../../server/@types/licenceApiClientTypes'
import CurfewType from '../../server/enumeration/CurfewType'

context('Create a licence', () => {
  const dates: string[] = []

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubProbationSignIn')
    cy.task('stubGetStaffDetails')
    cy.task('stubGetLicence', {})
    cy.task('stubSearchForAddresses')
    cy.task('stubGetStaffPreferredAddresses')
    cy.task('stubPutLicenceAppointmentPerson')
    cy.task('stubUpdateStandardConditions')
    cy.task('stubRecordAuditEvent')
    cy.task('stubGetLicencePolicyConditions')
    cy.task('stubGetActivePolicyConditions')
    cy.task('stubGetBankHolidays', dates)
    cy.task('stubAddAdditionalCondition')
    cy.task('stubDeleteAdditionalConditionsByCode')
    cy.task('stubFeComponents')
    cy.task('stubPostLicence')
    cy.signIn()
  })

  it('should click through the create a licence journey', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    const conditions = [
      ...licenceConditions.map(condition => {
        if (condition.code === '9ae2a336-3491-4667-aaed-dd852b09b4b9') {
          return { ...condition, requiresInput: false }
        }
        return condition
      }),
    ] as AdditionalCondition[]

    let caseloadPage = indexPage.clickCreateALicence()
    const comDetailsPage = caseloadPage.clickComName()
    caseloadPage = comDetailsPage.clickReturnToCaseload()
    const confirmCreatePage = caseloadPage.clickNameToCreateLicence()
    const releaseDateRow = confirmCreatePage.getReleaseDateStatus()
    releaseDateRow.should('contain', 'Friday 19 July 2024')
    releaseDateRow.should(
      'contain',
      'Check this date with the prison. It may change because it is on or just before a weekend or bank holiday. This may affect the initial appointment.',
    )

    const appointmentPersonPage = confirmCreatePage.clickContinue()
    const appointmentPlacePage = appointmentPersonPage.enterPerson('Duty Officer').clickContinue()
    const selectAddressPage = appointmentPlacePage.enterAddressOrPostcode('123 Fake Street').findAddress()
    const appointmentContactPage = selectAddressPage.selectAddress().clickContinue()

    const appointmentTimePage = appointmentContactPage.enterTelephone('012345678', '012345679').clickContinue()

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
        .selectCondition('9ae2a336-3491-4667-aaed-dd852b09b4b9')
        .clickContinue()

      const bespokeConditionsQuestionPage = additionalConditionsInputPage
        .withContext(additionalConditionsPage.getContext())
        .selectRadio('London')
        .nextCondition()
        .selectRadio()
        .nextCondition()
        .checkBoxes()
        .nextCondition(false) // aria-expanded attribute causes issues with Axe
        .selectRadio(CurfewType.TWO_CURFEWS)
        .addTwoCurfews(2)
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
        .clickContinue(conditions)
        .checkIfChangeLinkVisible('5db26ab3-9b6f-4bee-b2aa-53aa3f3be7dd')
        .checkIfDeleteLinkVisible('9ae2a336-3491-4667-aaed-dd852b09b4b9')

      const confirmationPage = checkAnswersPage.clickSendLicenceConditionsToPrison()
      const caseloadPageExit = confirmationPage.clickReturn()
      caseloadPageExit.signOut().click()
    })
  })

  it('should click through the create a licence journey for a PSS-only licence', () => {
    cy.task('stubGetPssLicence')
    const indexPage = Page.verifyOnPage(IndexPage)
    const caseloadPage = indexPage.clickCreateAPssLicence()
    const confirmCreatePage = caseloadPage.clickNameToCreateLicence()
    const appointmentPersonPage = confirmCreatePage.clickContinue()
    const appointmentPlacePage = appointmentPersonPage.enterPerson('Duty Officer').clickContinue()
    const selectAddressPage = appointmentPlacePage.enterAddressOrPostcode('123 Fake Street').findAddress()
    const appointmentContactPage = selectAddressPage.selectAddress().clickContinue()

    const appointmentTimePage = appointmentContactPage.enterTelephone('012345678', '012345679').clickContinue()

    cy.task('getNextWorkingDay', dates).then(appointmentDate => {
      const pssConditionsQuestionPage = appointmentTimePage
        .selectTypePss('SPECIFIC_DATE_TIME')
        .enterDate(moment(appointmentDate))
        .enterTime(moment())
        .clickContinueToPss()

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

      const confirmationPage = checkAnswersPage.clickSendLicenceConditionsToPrison()
      const caseloadPageExit = confirmationPage.clickReturnPss()
      caseloadPageExit.signOut().click()
    })
  })

  it('should not allow a licence to be submitted without initial appointment details', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    const caseloadPage = indexPage.clickCreateALicence()
    const confirmCreatePage = caseloadPage.clickNameToCreateLicence()

    const appointmentPersonPage = confirmCreatePage.clickContinue()
    const appointmentPlacePage = appointmentPersonPage.enterPerson('Duty Officer').clickContinue()
    const selectAddressPage = appointmentPlacePage.enterAddressOrPostcode('123 Fake Street').findAddress()
    const appointmentContactPage = selectAddressPage.selectAddress().clickContinue()

    const appointmentTimePage = appointmentContactPage.enterTelephone('012345678', '012345679').clickContinue()

    cy.task('getNextWorkingDay', dates).then(() => {
      const checkAnswersPage = appointmentTimePage
        .clickSkip()
        .selectNo()
        .clickContinueAfterNo()
        .selectNo()
        .clickContinueAfterNo()
        .selectNo()
        .clickContinueAfterNo()

      checkAnswersPage.clickSubmitLicenceWithErrors().getErrorSummary().should('exist')
    })
  })

  it('should not allow a licence to be submitted if any input pages have been skipped', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    const caseloadPage = indexPage.clickCreateALicence()
    const confirmCreatePage = caseloadPage.clickNameToCreateLicence()

    const appointmentPersonPage = confirmCreatePage.clickContinue()
    const appointmentPlacePage = appointmentPersonPage.enterPerson('Duty Officer').clickContinue()
    const selectAddressPage = appointmentPlacePage.enterAddressOrPostcode('123 Fake Street').findAddress()
    const appointmentContactPage = selectAddressPage.selectAddress().clickContinue()

    const appointmentTimePage = appointmentContactPage.enterTelephone('012345678', '012345679').clickContinue()

    cy.task('getNextWorkingDay', dates).then(appointmentDate => {
      const additionalConditionsPage = appointmentTimePage
        .selectType('SPECIFIC_DATE_TIME')
        .enterDate(moment(appointmentDate))
        .enterTime(moment())
        .clickContinue()
        .selectYes()
        .clickContinue()

      const additionalConditionsInputPage = additionalConditionsPage
        .selectCondition('d36a3b77-30ba-40ce-8953-83e761d3b487')
        .clickContinue()

      const bespokeConditionsQuestionPage = additionalConditionsInputPage
        .withContext(additionalConditionsPage.getContext())
        .clickSkip()

      cy.task('stubGetLicenceWithSkippedInputs')

      const checkAnswersPage = bespokeConditionsQuestionPage
        .selectNo()
        .clickContinueAfterNo()
        .selectNo()
        .clickContinueAfterNo()

      checkAnswersPage.clickSubmitLicenceWithErrors().getErrorSummary().should('exist')
    })
  })

  it('should allow a licence to be submitted without initial appointment date and time if appointment type is other than SPECIFIC_DATE_TIME', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    const caseloadPage = indexPage.clickCreateALicence()
    const confirmCreatePage = caseloadPage.clickNameToCreateLicence()

    const appointmentPersonPage = confirmCreatePage.clickContinue()
    const appointmentPlacePage = appointmentPersonPage.enterPerson('Duty Officer').clickContinue()
    const selectAddressPage = appointmentPlacePage.enterAddressOrPostcode('123 Fake Street').findAddress()
    const appointmentContactPage = selectAddressPage.selectAddress().clickContinue()

    const appointmentTimePage = appointmentContactPage.enterTelephone('012345678', '012345679').clickContinue()

    cy.task('getNextWorkingDay', dates).then(() => {
      const additionalConditionsPage = appointmentTimePage
        .selectType('IMMEDIATE_UPON_RELEASE')
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
        .selectRadio(CurfewType.TWO_CURFEWS)
        .addTwoCurfews(2)
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

      const confirmationPage = checkAnswersPage.clickSendLicenceConditionsToPrison()
      const caseloadPageExit = confirmationPage.clickReturn()
      caseloadPageExit.signOut().click()
    })
  })

  it('should have only one Date/time field if appointment time type is other than SPECIFIC_DATE_TIME', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    const caseloadPage = indexPage.clickCreateALicence()
    const confirmCreatePage = caseloadPage.clickNameToCreateLicence()

    const appointmentPersonPage = confirmCreatePage.clickContinue()
    const appointmentPlacePage = appointmentPersonPage.enterPerson('Duty Officer').clickContinue()
    const selectAddressPage = appointmentPlacePage.enterAddressOrPostcode('123 Fake Street').findAddress()
    const appointmentContactPage = selectAddressPage.selectAddress().clickContinue()

    const appointmentTimePage = appointmentContactPage.enterTelephone('012345678', '012345679').clickContinue()

    cy.task('getNextWorkingDay', dates).then(() => {
      const checkAnswersPage = appointmentTimePage
        .selectType('NEXT_WORKING_DAY_2PM')
        .clickContinue()
        .selectNo()
        .clickContinueAfterNo()
        .selectNo()
        .clickContinueAfterNo()
        .selectNo()
        .clickContinueAfterNo()

      checkAnswersPage.dateTimeField().should('contain.text', 'Date/time')
    })
  })

  it('should have separate Date and time field if appointment time type is SPECIFIC_DATE_TIME', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    const caseloadPage = indexPage.clickCreateALicence()
    const confirmCreatePage = caseloadPage.clickNameToCreateLicence()

    const appointmentPersonPage = confirmCreatePage.clickContinue()
    const appointmentPlacePage = appointmentPersonPage.enterPerson('Duty Officer').clickContinue()
    const selectAddressPage = appointmentPlacePage.enterAddressOrPostcode('123 Fake Street').findAddress()
    const appointmentContactPage = selectAddressPage.selectAddress().clickContinue()

    const appointmentTimePage = appointmentContactPage.enterTelephone('012345678', '012345679').clickContinue()

    cy.task('getNextWorkingDay', dates).then(appointmentDate => {
      const checkAnswersPage = appointmentTimePage
        .selectType('SPECIFIC_DATE_TIME')
        .enterDate(moment(appointmentDate))
        .enterTime(moment())
        .clickContinue()
        .selectNo()
        .clickContinueAfterNo()
        .selectNo()
        .clickContinueAfterNo()
        .selectNo()
        .clickContinueAfterNo()

      checkAnswersPage.dateTimeField().should('contain.text', 'Date')
      checkAnswersPage.dateTimeField().should('contain.text', 'Time')
    })
  })

  it('should not allow a licence to be submitted if any input pages have been skipped', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    const caseloadPage = indexPage.clickCreateALicence()
    const confirmCreatePage = caseloadPage.clickNameToCreateLicence()

    const appointmentPersonPage = confirmCreatePage.clickContinue()
    const appointmentPlacePage = appointmentPersonPage.enterPerson('Duty Officer').clickContinue()
    const selectAddressPage = appointmentPlacePage.enterAddressOrPostcode('123 Fake Street').findAddress()
    const appointmentContactPage = selectAddressPage.selectAddress().clickContinue()

    const appointmentTimePage = appointmentContactPage.enterTelephone('012345678', '012345679').clickContinue()

    cy.task('getNextWorkingDay', dates).then(appointmentDate => {
      const additionalConditionsPage = appointmentTimePage
        .selectType('SPECIFIC_DATE_TIME')
        .enterDate(moment(appointmentDate))
        .enterTime(moment())
        .clickContinue()
        .selectYes()
        .clickContinue()

      const additionalConditionsInputPage = additionalConditionsPage
        .selectCondition('d36a3b77-30ba-40ce-8953-83e761d3b487')
        .clickContinue()

      const bespokeConditionsQuestionPage = additionalConditionsInputPage
        .withContext(additionalConditionsPage.getContext())
        .clickSkip()

      cy.task('stubGetLicenceWithSkippedInputs')

      const checkAnswersPage = bespokeConditionsQuestionPage
        .selectNo()
        .clickContinueAfterNo()
        .selectNo()
        .clickContinueAfterNo()

      checkAnswersPage.clickSubmitLicenceWithErrors().getErrorSummary().should('exist')
    })
  })

  it('should select specific date time option default on initial appointment details', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    let caseloadPage = indexPage.clickCreateALicence()
    const comDetailsPage = caseloadPage.clickComName()
    caseloadPage = comDetailsPage.clickReturnToCaseload()
    const confirmCreatePage = caseloadPage.clickNameToCreateLicence()

    const appointmentPersonPage = confirmCreatePage.clickContinue()
    const appointmentPlacePage = appointmentPersonPage.enterPerson('Duty Officer').clickContinue()
    const selectAddressPage = appointmentPlacePage.enterAddressOrPostcode('123 Fake Street').findAddress()
    const appointmentContactPage = selectAddressPage.selectAddress().clickContinue()

    const appointmentTimePage = appointmentContactPage.enterTelephone('012345678', '012345679').clickContinue()
    appointmentTimePage.getRadioByValue('SPECIFIC_DATE_TIME').should('be.checked')
  })
})
