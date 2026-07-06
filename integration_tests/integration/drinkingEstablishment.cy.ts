import moment from 'moment'
import Page from '../pages/page'
import IndexPage from '../pages'

const DRINKING_ESTABLISHMENT_CONDITION_CODE = 'be16ee0b-a916-43ef-9319-b42a1dd418a3'

context('Create a licence', () => {
  const dates: string[] = []

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubProbationSignIn')
    cy.task('stubGetStaffDetails')
    cy.task('stubGetEmptyLicence')
    cy.task('stubSearchForAddresses')
    cy.task('stubGetStaffPreferredAddresses')
    cy.task('stubPutLicenceAppointmentPerson')
    cy.task('stubRecordAuditEvent')
    cy.task('stubGetLicencePolicyConditions', '4.0')
    cy.task('stubGetActivePolicyConditions')
    cy.task('stubGetBankHolidays', dates)
    cy.task('stubAddAdditionalCondition')
    cy.task('stubFeComponents')
    cy.task('stubPostProbationLicence')
    cy.task('stubCheckComCaseAccess')
    cy.task('stubUpdatePolicy')
    cy.signIn()
  })

  it('should add restriction times for drinking establishments', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    const caseloadPage = indexPage.clickCreateALicence()
    const confirmCreatePage = caseloadPage.clickNameToCreateLicence()

    const appointmentPersonPage = confirmCreatePage.clickContinue()
    appointmentPersonPage.selectAppointmentPersonType(3)
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
        .selectCondition(DRINKING_ESTABLISHMENT_CONDITION_CODE)
        .clickContinue()

      const bespokeConditionsQuestionPage = additionalConditionsInputPage
        .withContext(additionalConditionsPage.getContext())
        .selectRadio('Between specified times')
        .enterTime('8', '0', 'firstCurfewStart')
        .enterTime('10', '30', 'firstCurfewEnd')
        .enterTime('11', '10', 'secondCurfewStart')
        .enterTime('12', '40', 'secondCurfewStart')
        .clickContinue()

      cy.task('stubGetCompletedLicence', {
        statusCode: 'IN_PROGRESS',
        typeCode: 'AP',
        appointmentTelephoneNumber: '0114 2345232334',
      })

      const checkAnswersPage = bespokeConditionsQuestionPage.selectNo().clickContinueAfterNo()
      const confirmationPage = checkAnswersPage.clickSendLicenceConditionsToPrison()
      const caseloadPageExit = confirmationPage.clickReturn()
      caseloadPageExit.signOut().click()
    })
  })
})
