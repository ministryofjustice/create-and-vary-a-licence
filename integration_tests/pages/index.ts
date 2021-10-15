import Page from './page'
import CaseloadPage from './caseload'
import ApprovalCasesPage from './approvalCases'

export default class IndexPage extends Page {
  private createLicenceTileId = '#createLicenceCard'

  private approveLicenceTileId = '#approveLicenceCard'

  constructor() {
    super('index-page')
  }

  clickCreateALicence = (): CaseloadPage => {
    cy.task('stubGetStaffDetails')
    cy.task('stubGetManagedOffenders')
    cy.task('searchPrisonersByNomisIds')
    cy.task('stubGetLicencesByStaffIdAndStatus')
    cy.task('stubGetPrisonerDetail')
    cy.task('stubGetProbationer')
    cy.task('stubGetPrisonInformation')
    cy.get(this.createLicenceTileId).click()
    return Page.verifyOnPage(CaseloadPage)
  }

  clickApproveALicence = (): ApprovalCasesPage => {
    cy.get(this.approveLicenceTileId).click()
    return Page.verifyOnPage(ApprovalCasesPage)
  }
}
