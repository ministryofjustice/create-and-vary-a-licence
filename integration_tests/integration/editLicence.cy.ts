import Page from '../pages/page'
import IndexPage from '../pages'

context('Edit a licence before release', () => {
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
    cy.task('stubGetCutOffDateForLicenceTimeOut')
    cy.signIn()
  })

  it('should click through edit journey', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    const caseloadPage = indexPage.clickCreateALicenceToEdit()
    let checkAnswersPage = caseloadPage.clickNameToEditLicence()
    const editLicenceQuestionPage = checkAnswersPage.clickEditLicence()
    checkAnswersPage = editLicenceQuestionPage.selectYes().clickContinue()
    const confirmationPage = checkAnswersPage.clickSendLicenceConditionsToPrison()
    const caseloadPageExit = confirmationPage.clickReturn()
    caseloadPageExit.signOut().click()
  })
})
