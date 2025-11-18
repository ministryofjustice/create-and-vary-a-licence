import Page from '../../pages/page'
import IndexPage from '../../pages'
import LicenceStatus from '../../../server/enumeration/licenceStatus'

context('Vary a licence time served', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubProbationSignIn')
    cy.task('stubGetStaffDetails')
    cy.task('stubGetStaffVaryCaseload', {
      licenceId: 1,
      licenceStatus: LicenceStatus.ACTIVE,
    })
    cy.task('stubGetCompletedLicence', {
      statusCode: 'ACTIVE',
      kind: 'TIME_SERVED',
      isReviewNeeded: true,
    })
    cy.signIn()
  })

  it('when time served licence then correct review message should be shown', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    const varyCasesPage = indexPage.clickVaryALicence()
    const timelinePage = varyCasesPage.selectCase()
    timelinePage.checkThatPageHaveTimeServedMessage()
  })
})
