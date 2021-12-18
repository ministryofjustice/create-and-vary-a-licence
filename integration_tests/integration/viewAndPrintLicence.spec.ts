import Page from '../pages/page'
import IndexPage from '../pages'

context('View and print licence', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubPrisonSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetPrisonUserDetails')
    cy.task('stubGetPrisonUserCaseloads')
    cy.task('stubGetCompletedLicence', 'APPROVED')
    cy.task('stubGetLicencesForStatus', 'APPROVED')
    cy.signIn()
  })

  it('should click through the view and print a licence journey', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    let viewCasesList = indexPage.clickViewAndPrintALicence()
    const comDetails = viewCasesList.clickComDetails()
    viewCasesList = comDetails.clickReturn()
    const viewLicencePage = viewCasesList.clickALicence()
    const printALicencePage = viewLicencePage.printALicence()
    printALicencePage.checkPrintTemplate()
  })
})
