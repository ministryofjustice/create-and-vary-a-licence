import IndexPage from '../pages'
import AuthSignInPage from '../pages/authSignIn'
import Page from '../pages/page'

context('SignIn with common header', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubProbationSignIn')
    cy.task('stubGetStaffDetails')
    cy.task('stubFeComponents')
  })

  it('Unauthenticated user directed to auth', () => {
    cy.visit('/')
    Page.verifyOnPage(AuthSignInPage)
  })

  it('Commmon components header and footer are displayed', () => {
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    indexPage.commonComponentsHeader().should('exist')
    indexPage.commonComponentsFooter().should('exist')
  })
})
