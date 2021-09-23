const IndexPage = require('../pages/index')
// const ConfirmationPage = require('../pages/confirmation')

context('Create a Licence', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
  })

  it('User can create a licence', () => {
    cy.login()
    IndexPage.verifyOnPage()
    // TODO: Needs forerunners to be implemented first
    // ConfirmationPage.verifyOnPage()
  })
})
