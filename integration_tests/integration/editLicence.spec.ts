import Page from '../pages/page'
import IndexPage from '../pages'

context('Edit a licence before release', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubProbationSignIn')
    cy.task('stubGetStaffDetails')
    cy.task('stubAuthUser')
    cy.task('stubGetLicence')
    cy.signIn()
  })

  it('should click through edit journey', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    const caseloadPage = indexPage.clickCreateALicence()
    let checkAnswersPage = caseloadPage.clickNameToEditLicence()
    const editLicenceQuestionPage = checkAnswersPage.clickEditLicence()
    checkAnswersPage = editLicenceQuestionPage.selectYes().clickContinue()
    const confirmationPage = checkAnswersPage.clickSendLicenceConditionsToPrison()
    const indexPageExit = confirmationPage.clickReturnHome()
    indexPageExit.signOut().click()
  })
})
