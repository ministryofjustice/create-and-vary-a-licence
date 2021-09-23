const IndexPage = require('../pages/index')
// const ConfirmationPage = require('../pages/confirmation')

context('Create a Licence', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
    cy.task('stubGetLicence', 1)
  })

  it('User can create a licence', () => {
    cy.login()
    IndexPage.verifyOnPage()
    // TODO: Needs forerunners to be implemented first
    // TODO: Needs the list & selection from list
    // TODO: Needs API calls stubbed - prisoner-offender-search, communityApi (for caseload)
    // ConfirmationPage.verifyOnPage()
  })
})
