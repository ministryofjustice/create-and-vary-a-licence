import Page from '../pages/page'
import IndexPage from '../pages'
import CaSearchPage from '../pages/caSearch'

context('Search for a person', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubPrisonSignIn')
    cy.task('stubGetPrisonUserDetails')
    cy.task('stubGetPrisonUserCaseloads', {
      details: [
        {
          caseLoadId: 'LEI',
          caseloadFunction: 'GENERAL',
          currentlyActive: true,
          description: 'Leeds (HMP)',
          type: 'INST',
        },
      ],
    })
    cy.task('stubGetPrisonOmuCaseload')
    cy.task('stubGetProbationOmuCaseload')
    cy.task('stubGetPrisons')
    cy.task('stubFeComponents')
    cy.signIn()
  })

  it('should click through search journey and show empty states where no results are present', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    const caseloadPage = indexPage.clickViewAndPrintALicence()
    const searchPage = caseloadPage.clickSearch('test')
    searchPage.getSearchHeading().contains('Search results for test')
    searchPage.getPrisonTabTitle().contains('People in prison (0 results)')
    Page.verifyOnPage(CaSearchPage)
  })
})
