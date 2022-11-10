import moment from 'moment'
import Page from '../pages/page'
import IndexPage from '../pages'

context('Create a licence', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubProbationSignIn')
    cy.task('stubGetStaffDetails')
    cy.task('stubAuthUser')
    cy.task('stubGetLicence')
    cy.task('stubUpdateStandardConditions')
    cy.task('stubRecordAuditEvent')
    cy.task('stubGetLicencePolicyConditions')
    cy.task('stubGetActivePolicyConditions')
    cy.signIn()
  })

  it('should click through the create a licence journey', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    let caseloadPage = indexPage.clickCreateALicence()
    const comDetailsPage = caseloadPage.clickComName()
    caseloadPage = comDetailsPage.clickReturnToCaseload()
    const confirmCreatePage = caseloadPage.clickNameToCreateLicence()

    const appointmentPersonPage = confirmCreatePage.selectYes().clickContinue()
    const appointmentPlacePage = appointmentPersonPage.enterPerson('Freddie Mercury').clickContinue()
    const appointmentContactPage = appointmentPlacePage
      .enterAddressLine1('123 Fake Street')
      .enterTown('Fakestown')
      .enterCounty('Durham')
      .enterPostcode('DH11AF')
      .clickContinue()

    const appointmentTimePage = appointmentContactPage.enterTelephone('07892123456').clickContinue()

    /*
     select the next wednesday one year from now in order to avoid weekends and
     bank holidays, with the possible exceptions of Xmas and New Year
     */
    const appointmentDate = moment().add(1, 'year').add(1, 'week').day(3)
    if (appointmentDate.month() === 11) {
      appointmentDate.add(1, 'month') // advance to Jan to avoid Xmas and New Year
    }

    const additionalConditionsPage = appointmentTimePage
      .enterDate(appointmentDate)
      .enterTime(moment())
      .clickContinue()
      .selectYes()
      .clickContinue()

    const additionalConditionsInputPage = additionalConditionsPage
      .selectCondition('5db26ab3-9b6f-4bee-b2aa-53aa3f3be7dd')
      .selectCondition('fce34fb2-02f4-4eb0-9b8d-d091e11451fa')
      .selectCondition('d36a3b77-30ba-40ce-8953-83e761d3b487')
      .selectCondition('fd129172-bdd3-4d97-a4a0-efd7b47a49d4')
      .selectCondition('86e6f2a9-bb60-40f8-9ac4-310ebc72ac2f')
      .selectCondition('0a370862-5426-49c1-b6d4-3d074d78a81a')
      .selectCondition('3932e5c9-4d21-4251-a747-ce6dc52dc9c0')
      .selectCondition('524f2fd6-ad53-47dd-8edc-2161d3dd2ed4')
      .clickContinue()

    const bespokeConditionsQuestionPage = additionalConditionsInputPage
      .withContext(additionalConditionsPage.getContext())
      .selectRadio('London')
      .nextCondition()
      .selectRadio()
      .nextCondition()
      .enterDate()
      .nextCondition()
      .checkBoxes()
      .nextCondition()
      .enterAddress()
      .nextCondition(false) // aria-expanded attribute causes issues with Axe
      .enterTime('10', '30', 'curfewStart')
      .enterTime('11', '30', 'curfewEnd')
      .selectRadio('Other')
      .enterText('Annually', 'alternativeReviewPeriod')
      .nextCondition()
      .enterText('Knives', 'item[0]')
      .clickAddAnother()
      .enterText('Needles', 'item[1]')
      .nextCondition()
      .clickContinue()

    const bespokeConditionsPage = bespokeConditionsQuestionPage.selectYes().clickContinue()

    const pssConditionsQuestionPage = bespokeConditionsPage
      .enterBespokeCondition(0, 'An unusual bespoke condition to be approved.')
      .clickAddAnother()
      .enterBespokeCondition(1, 'Another unusual and unlikely bespoke condition')
      .clickAddAnother()
      .enterBespokeCondition(2, 'A third bespoke condition must surely be be a mistake')
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
