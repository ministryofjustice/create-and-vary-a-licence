import moment from 'moment'
import ConfirmCreatePage from '../pages/confirmCreate'
import LicenceCreationType from '../../server/enumeration/licenceCreationType'
import CurfewType from '../../server/enumeration/CurfewType'

context('Create an HDC licence', () => {
  const dates: string[] = []

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubProbationSignIn')
    cy.task('stubGetStaffDetails')
    cy.task('stubGetHdcCaseloadItem')
    cy.task('stubSearchForAddresses')
    cy.task('stubGetStaffPreferredAddresses')
    cy.task('stubPutLicenceAppointmentPerson')
    cy.task('stubGetHdcLicence')
    cy.task('stubGetProbationer')
    cy.task('stubGetResponsibleCommunityManager')
    cy.task('searchPrisonersByBookingIds', '2024-07-09')
    cy.task('stubGetHdcLicencesForOffender', { status: 'APPROVED', bookingId: 1201102 })
    cy.task('stubUpdateStandardConditions')
    cy.task('stubRecordAuditEvent')
    cy.task('stubGetLicencePolicyConditions')
    cy.task('stubGetActivePolicyConditions')
    cy.task('stubDeleteAdditionalConditionsByCode')
    cy.task('stubGetBankHolidays', dates)
    cy.task('stubAddAdditionalCondition')
    cy.task('stubFeComponents')
    cy.task('stubPostProbationLicence')
    cy.signIn()
  })

  it('should click through the create a licence journey', () => {
    cy.visit('/licence/hdc/create/nomisId/G9786GC/confirm')
    const confirmCreatePage = new ConfirmCreatePage()

    const appointmentPersonPage = confirmCreatePage.clickContinue()
    const appointmentPlacePage = appointmentPersonPage.enterPerson('Test officer').clickContinue()
    const selectAddressPage = appointmentPlacePage.enterAddressOrPostcode('123 Fake Street').findAddress()
    const appointmentContactPage = selectAddressPage.selectAddress().clickContinue()

    const appointmentTimePage = appointmentContactPage.enterTelephone('012345678', '012345679').clickContinue()

    cy.task('getNextWorkingDay', dates).then(appointmentDate => {
      const additionalConditionsPage = appointmentTimePage
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
      cy.task('stubGetStaffCreateCaseload', {
        licenceId: 1,
        licenceStatus: 'SUBMITTED',
        licenceCreationType: LicenceCreationType.LICENCE_IN_PROGRESS,
      })
      const caseloadPageExit = confirmationPage.clickReturn()
      caseloadPageExit.signOut().click()
    })
  })
})
