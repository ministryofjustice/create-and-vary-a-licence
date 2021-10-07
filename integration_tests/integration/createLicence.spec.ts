import moment from 'moment'
import Page from '../pages/page'
import IndexPage from '../pages'

context('Create a licence', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetLicence', 1)
    cy.task('stubPostLicence')
    cy.task('stubPutAppointmentPerson', 1)
    cy.task('stubPutAppointmentTime', 1)
    cy.task('stubPutAppointmentAddress', 1)
    cy.task('stubPutBespokeConditions', 1)
    cy.task('stubPutContactNumber', 1)
    cy.task('stubGetStaffDetails', 'USER1')
    cy.task('stubGetManagedOffenders', 2000)
    cy.task('searchPrisonersByNomisIds')
    cy.task('stubGetPrisonDescription', 'LEI')
    cy.task('stubGetLicencesByStaffIdAndStatus', 2000)
    cy.signIn()
  })

  it('should click through the create a licence journey', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    const caseloadPage = indexPage.clickCreateALicence()
    const appointmentPersonPage = caseloadPage.clickCreateLicence()

    const appointmentPlacePage = appointmentPersonPage.enterPerson('Freddie Mercury').clickContinue()

    const appointmentContactPage = appointmentPlacePage
      .enterAddressLine1('123 Fake Street')
      .enterTown('Fakestown')
      .enterCounty('Durham')
      .enterPostcode('DH11AF')
      .clickContinue()

    const appointmentTimePage = appointmentContactPage.enterTelephone('07892123456').clickContinue()

    const additionalConditionsQuestionPage = appointmentTimePage
      .enterDate(moment().add(1, 'year'))
      .enterTime(moment())
      .clickContinue()

    const additionalConditionsPage = additionalConditionsQuestionPage.selectYes().clickContinue()

    const bespokeConditionsQuestionPage = additionalConditionsPage.clickContinue()

    const bespokeConditionsPage = bespokeConditionsQuestionPage.selectYes().clickContinue()

    const checkAnswersPage = bespokeConditionsPage
      .enterBespokeCondition(0, 'An unusual bespoke condition to be approved.')
      .clickAddAnother()
      .enterBespokeCondition(1, 'Another unusual and unlikely bespoke condition')
      .clickAddAnother()
      .enterBespokeCondition(2, 'A third bespoke condition must surely be be a mistake')
      .clickContinue()

    const confirmationPage = checkAnswersPage.clickSendLicenceConditionsToPrison()

    confirmationPage.clickReturnHome()
  })
})
