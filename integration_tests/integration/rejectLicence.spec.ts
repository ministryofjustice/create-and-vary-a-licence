import Page from '../pages/page'
import IndexPage from '../pages'
import { GetLicenceArgs } from '../types/testArguments'
import LicenceStatus from '../../server/enumeration/licenceStatus'

context('Reject a licence', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubPrisonSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetLicence', { licenceId: '1', licenceStatus: LicenceStatus.SUBMITTED } as GetLicenceArgs)
    cy.task('stubGetLicencesForApproval')
    cy.task('stubUpdateLicenceStatus', 1)
    cy.signIn()
  })

  it('should click through the reject a licence journey', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    const approvalCasesPage = indexPage.clickApproveALicence()
    const approvalViewPage = approvalCasesPage.clickApproveLicence()
    const confirmRejectPage = approvalViewPage.clickReject()
    const approvalCasesPage2 = confirmRejectPage.clickReturnToList()
    approvalCasesPage2.signOut().click()
  })
})
