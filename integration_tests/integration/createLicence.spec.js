const IndexPage = require('../pages/index')

context('Create a Licence', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
  })

  it('User can create a licence', () => {
    cy.login()
    IndexPage.verifyOnPage()
    // TODO: Expand this test as the journey is built
  })
})
