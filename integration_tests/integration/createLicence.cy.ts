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
    cy.task('stubGetLicence', { hasAppointmentTimeType: false })
    cy.task('stubSearchForAddresses')
    cy.task('stubGetStaffPreferredAddresses')
    cy.task('stubPutLicenceAppointmentPerson')
    cy.task('stubUpdatePolicy')
    cy.task('stubRecordAuditEvent')
    cy.task('stubGetLicencePolicyConditions')
    cy.task('stubGetActivePolicyConditions')
    cy.task('stubGetBankHolidays', dates)
    cy.task('stubAddAdditionalCondition')
    cy.task('stubDeleteAdditionalConditionsByCode')
    cy.task('stubFeComponents')
    cy.task('stubPostProbationLicence')
    cy.task('stubCheckComCaseAccess')
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

    const caseloadPage = indexPage.clickCreateALicence(true)
    const confirmCreatePage = caseloadPage.clickNameToCreateLicence()
    const releaseDateRow = confirmCreatePage.getReleaseDateStatus()
    releaseDateRow.should('contain', 'Friday 19 July 2024')
    releaseDateRow.should(
      'contain',
      'Check this date with the prison. It may change because it is on or just before a weekend or bank holiday. This may affect the initial appointment.',
    )
    cy.task('stubGetLicence', { isEligibleForEarlyRelease: true, hasAppointmentTimeType: 'IMMEDIATE_UPON_RELEASE' })
    const appointmentPersonPage = confirmCreatePage.clickContinue()
    appointmentPersonPage.selectAppointmentPersonType(2)
    const appointmentPlacePage = appointmentPersonPage.enterPerson('Test officer').clickContinue()
    const selectAddressPage = appointmentPlacePage.enterAddressOrPostcode('123 Fake Street').findAddress()
    const appointmentContactPage = selectAddressPage.selectAddress().clickContinue()

    const appointmentTimePage = appointmentContactPage.enterTelephone('012345678', '012345679').clickContinue()

    cy.task('getNextWorkingDay', dates).then(appointmentDate => {
      appointmentTimePage.selectType('SPECIFIC_DATE_TIME').enterDate(moment(appointmentDate)).enterTime(moment())
      appointmentTimePage
        .getEarlyReleaseWarning()
        .should('contain.text', 'This person is eligible for Friday or pre-bank holiday release scheme.')
        .should('contain.text', 'It may impact their initial appointment.')
      const additionalConditionsPage = appointmentTimePage.clickContinue().selectYes().clickContinue()

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

      const checkAnswersPage = bespokeConditionsPage
        .enterBespokeCondition(0, 'An unusual bespoke condition to be approved.')
        .checkDeleteThisCondition() // for single Bespoke Condition
        .clickAddAnother()
        .enterBespokeCondition(1, 'Another unusual and unlikely bespoke condition')
        .checkDeleteTheseConditions() // for multiple Bespoke Condition
        .clickAddAnother()
        .enterBespokeCondition(2, 'A final third bespoke condition')
        .checkDeleteTheseConditions() // for multiple Bespoke Condition
        .clickContinue(conditions)

      const confirmationPage = checkAnswersPage
        .checkIfChangeLinkVisible('5db26ab3-9b6f-4bee-b2aa-53aa3f3be7dd')
        .clickSendLicenceConditionsToPrison()

      const caseloadPageExit = confirmationPage.clickReturn()
      caseloadPageExit.signOut().click()
    })
  })

  it('should not allow a licence to be submitted without initial appointment details', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    const caseloadPage = indexPage.clickCreateALicence()
    const confirmCreatePage = caseloadPage.clickNameToCreateLicence()

    const appointmentPersonPage = confirmCreatePage.clickContinue()
    appointmentPersonPage.selectAppointmentPersonType(2)
    const appointmentPlacePage = appointmentPersonPage.enterPerson('Test officer').clickContinue()
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

      checkAnswersPage.clickSubmitLicenceWithErrors().getErrorSummary().should('exist')
    })
  })

  it('should not allow a licence to be submitted if any input pages have been skipped', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    const caseloadPage = indexPage.clickCreateALicence()
    const confirmCreatePage = caseloadPage.clickNameToCreateLicence()

    const appointmentPersonPage = confirmCreatePage.clickContinue()
    appointmentPersonPage.selectAppointmentPersonType(2)
    const appointmentPlacePage = appointmentPersonPage.enterPerson('Test officer').clickContinue()
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

      const checkAnswersPage = bespokeConditionsQuestionPage.selectNo().clickContinueAfterNo()

      checkAnswersPage.clickSubmitLicenceWithErrors().getErrorSummary().should('exist')
    })
  })

  it('should allow a licence to be submitted without initial appointment date and time if appointment type is other than SPECIFIC_DATE_TIME', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    const caseloadPage = indexPage.clickCreateALicence()
    const confirmCreatePage = caseloadPage.clickNameToCreateLicence()

    const appointmentPersonPage = confirmCreatePage.clickContinue()
    appointmentPersonPage.selectAppointmentPersonType(2)
    const appointmentPlacePage = appointmentPersonPage.enterPerson('Test officer').clickContinue()
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
  })

  it('should have only one Date/time field if appointment time type is other than SPECIFIC_DATE_TIME', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    const caseloadPage = indexPage.clickCreateALicence()
    const confirmCreatePage = caseloadPage.clickNameToCreateLicence()

    const appointmentPersonPage = confirmCreatePage.clickContinue()
    appointmentPersonPage.selectAppointmentPersonType(2)
    const appointmentPlacePage = appointmentPersonPage.enterPerson('Test officer').clickContinue()
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

      checkAnswersPage.dateTimeField().should('contain.text', 'Date/time')
    })
  })

  it('should have separate Date and time field if appointment time type is SPECIFIC_DATE_TIME', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    const caseloadPage = indexPage.clickCreateALicence()
    const confirmCreatePage = caseloadPage.clickNameToCreateLicence()

    const appointmentPersonPage = confirmCreatePage.clickContinue()
    appointmentPersonPage.selectAppointmentPersonType(2)
    const appointmentPlacePage = appointmentPersonPage.enterPerson('Test officer').clickContinue()
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

      checkAnswersPage.dateTimeField().should('contain.text', 'Date')
      checkAnswersPage.dateTimeField().should('contain.text', 'Time')
    })
  })

  it('should not allow a licence to be submitted if any input pages have been skipped', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    const caseloadPage = indexPage.clickCreateALicence()
    const confirmCreatePage = caseloadPage.clickNameToCreateLicence()

    const appointmentPersonPage = confirmCreatePage.clickContinue()
    appointmentPersonPage.selectAppointmentPersonType(2)
    const appointmentPlacePage = appointmentPersonPage.enterPerson('Test officer').clickContinue()
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

      const checkAnswersPage = bespokeConditionsQuestionPage.selectNo().clickContinueAfterNo()
      checkAnswersPage.clickSubmitLicenceWithErrors().getErrorSummary().should('exist')
    })
  })

  it('should select specific date time option default on initial appointment details', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    const caseloadPage = indexPage.clickCreateALicence()
    const confirmCreatePage = caseloadPage.clickNameToCreateLicence()

    const appointmentPersonPage = confirmCreatePage.clickContinue()
    appointmentPersonPage.selectAppointmentPersonType(2)
    const appointmentPlacePage = appointmentPersonPage.enterPerson('Test officer').clickContinue()
    const selectAddressPage = appointmentPlacePage.enterAddressOrPostcode('123 Fake Street').findAddress()
    const appointmentContactPage = selectAddressPage.selectAddress().clickContinue()

    const appointmentTimePage = appointmentContactPage.enterTelephone('012345678', '012345679').clickContinue()
    appointmentTimePage.getRadioByValue('SPECIFIC_DATE_TIME').should('be.checked')
  })
})
