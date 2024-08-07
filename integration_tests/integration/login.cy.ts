import IndexPage from '../pages'
import AuthSignInPage from '../pages/authSignIn'
import Page from '../pages/page'

context('SignIn with fallback header', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubProbationSignIn')
    cy.task('stubGetStaffDetails')
    cy.task('stubFeComponentsFail')
  })

  it('Unauthenticated user directed to auth', () => {
    cy.visit('/')
    Page.verifyOnPage(AuthSignInPage)
  })

  it('Commmon components header and footer should not display', () => {
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    indexPage.commonComponentsHeader().should('not.exist')
    indexPage.commonComponentsFooter().should('not.exist')
  })

  it('User name visible in fallback header', () => {
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    indexPage.fallbackHeaderUserName().should('contain.text', 'J. Smith')
  })

  it('User can log out', () => {
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    indexPage.signOut().click()
    Page.verifyOnPage(AuthSignInPage)
  })
})
