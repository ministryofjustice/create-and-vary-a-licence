import Page from './page'
import CaseloadPage from './caseload'
import ApprovalCasesPage from './approvalCases'
import ViewCasesPage from './viewCases'

export default class IndexPage extends Page {
  private createLicenceTileId = '#createLicenceCard'

  private approveLicenceTileId = '#approveLicenceCard'

  private viewAndPrintTiledId = '#viewLicenceCard'

  constructor() {
    super('index-page')
  }

  clickCreateALicence = (): CaseloadPage => {
    cy.task('stubGetManagedOffenders')
    cy.task('searchPrisonersByNomisIds')
    cy.task('stubGetLicencesByStaffIdAndStatus')
    cy.task('stubGetPrisonerDetail')
    cy.task('stubGetProbationer')
    cy.task('stubGetPrisonInformation')
    cy.task('stubGetHdcStatus')
    cy.get(this.createLicenceTileId).click()
    return Page.verifyOnPage(CaseloadPage)
  }

  clickApproveALicence = (): ApprovalCasesPage => {
    cy.get(this.approveLicenceTileId).click()
    return Page.verifyOnPage(ApprovalCasesPage)
  }

  clickViewAndPrintALicence = (): ViewCasesPage => {
    cy.get(this.viewAndPrintTiledId).click()
    return Page.verifyOnPage(ViewCasesPage)
  }
}
