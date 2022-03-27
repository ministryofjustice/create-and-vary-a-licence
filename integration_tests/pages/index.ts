import Page from './page'
import CaseloadPage from './caseload'
import ApprovalCasesPage from './approvalCases'
import ViewCasesPage from './viewCases'
import VaryCasesPage from './varyCases'
import VaryApproveCasesPage from './varyApproveCasesPage'

export default class IndexPage extends Page {
  private createLicenceTileId = '#createLicenceCard'

  private varyLicenceTileId = '#varyLicenceCard'

  private approveLicenceTileId = '#approveLicenceCard'

  private viewAndPrintTiledId = '#viewLicenceCard'

  private approveVariationTiledId = '#approveVariationCard'

  constructor() {
    super('index-page')
  }

  clickCreateALicence = (): CaseloadPage => {
    cy.task('stubGetManagedOffenders')
    cy.task('stubGetOffendersByCrn')
    cy.task('searchPrisonersByNomisIds')
    cy.task('stubGetExistingLicencesForOffenders')
    cy.task('stubGetPrisonerDetail')
    cy.task('stubGetProbationer')
    cy.task('stubGetPrisonInformation')
    cy.task('stubGetHdcStatus')
    cy.task('stubGetAnOffendersManagers')
    cy.get(this.createLicenceTileId).click()
    return Page.verifyOnPage(CaseloadPage)
  }

  clickVaryALicence = (): VaryCasesPage => {
    cy.get(this.varyLicenceTileId).click()
    return Page.verifyOnPage(VaryCasesPage)
  }

  clickApproveALicence = (): ApprovalCasesPage => {
    cy.get(this.approveLicenceTileId).click()
    return Page.verifyOnPage(ApprovalCasesPage)
  }

  clickViewAndPrintALicence = (): ViewCasesPage => {
    cy.get(this.viewAndPrintTiledId).click()
    return Page.verifyOnPage(ViewCasesPage)
  }

  clickApproveAVariation = (): VaryApproveCasesPage => {
    cy.get(this.approveVariationTiledId).click()
    return Page.verifyOnPage(VaryApproveCasesPage)
  }
}
