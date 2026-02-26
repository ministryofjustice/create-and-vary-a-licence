import Page from '../pages/page'
import IndexPage from '../pages'

context('Edit a licence before release', () => {
  const dates: string[] = []

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubProbationSignIn')
    cy.task('stubGetStaffDetails')
    cy.task('stubUpdateStandardConditions')
    cy.task('stubRecordAuditEvent')
    cy.task('stubPutContactNumber')
    cy.task('stubGetLicencePolicyConditions')
    cy.task('stubGetActivePolicyConditions')
    cy.task('stubGetBankHolidays', dates)
    cy.task('stubFeComponents')
    cy.task('stubCheckComCaseAccess')
    cy.signIn()
  })

  it('should click through edit journey', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    const caseloadPage = indexPage.clickCreateALicenceToEdit()
    let checkAnswersPage = caseloadPage.clickNameToEditLicence()
    const editLicenceQuestionPage = checkAnswersPage.clickEditLicence()
    checkAnswersPage = editLicenceQuestionPage.selectYes().clickContinue({
      appointmentTelephoneNumber: '03632960901',
      appointmentAlternativeTelephoneNumber: '03632960902',
    })
    const confirmationPage = checkAnswersPage.clickSendLicenceConditionsToPrison()
    const caseloadPageExit = confirmationPage.clickReturn()
    caseloadPageExit.signOut().click()
  })

  it('should click through edit journey and enter telephone numbers ', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    const caseloadPage = indexPage.clickCreateALicenceToEdit()
    let checkAnswersPage = caseloadPage.clickNameToEditLicence()
    const editLicenceQuestionPage = checkAnswersPage.clickEditLicence()

    checkAnswersPage = editLicenceQuestionPage.selectYes().clickContinue({
      appointmentTelephoneNumber: '03632960901',
      appointmentAlternativeTelephoneNumber: '03632960902',
    })
    checkAnswersPage
      .clickChangeTelephoneLink()
      .enterTelephone('01632960901', '01632960904')
      .clickContinueToReturnToCheckAnswersPage()

    checkAnswersPage = checkAnswersPage
      .clickChangeAlternativeTelephoneLink()
      .enterTelephone('01632960903', '01632960904')
      .clickContinueToReturnToCheckAnswersPage()

    const confirmationPage = checkAnswersPage.clickSendLicenceConditionsToPrison()
    const caseloadPageExit = confirmationPage.clickReturn()
    caseloadPageExit.signOut().click()
  })

  it('should show as expected when when telephone numbers not given on licence page', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    const caseloadPage = indexPage.clickCreateALicenceToEdit()
    let checkAnswersPage = caseloadPage.clickNameToEditLicence()
    const editLicenceQuestionPage = checkAnswersPage.clickEditLicence()
    checkAnswersPage = editLicenceQuestionPage.selectYes().clickContinue({
      appointmentTelephoneNumber: null,
      appointmentAlternativeTelephoneNumber: null,
    })

    checkAnswersPage.checkTelephoneNotEntered()
    checkAnswersPage.checkAlternativeTelephoneLinkDoesExist()
    checkAnswersPage.checkAlternativeTelephoneNotEntered()
  })

  it('should show as expected when when telephone number are given on licence page', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    const caseloadPage = indexPage.clickCreateALicenceToEdit()
    let checkAnswersPage = caseloadPage.clickNameToEditLicence()
    const editLicenceQuestionPage = checkAnswersPage.clickEditLicence()
    checkAnswersPage = editLicenceQuestionPage.selectYes().clickContinue()

    checkAnswersPage.checkTelephoneEntered('0123456789')
    checkAnswersPage.checkAlternativeTelephoneLinkDoesExist()
    checkAnswersPage.checkAlternativeTelephoneEntered('0987654321')
  })
})
