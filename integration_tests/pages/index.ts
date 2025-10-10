import Page from './page'
import CaseloadPage from './caseload'
import ApprovalCasesPage from './approvalCases'
import ViewCasesPage from './viewCasesPage'
import VaryCasesPage from './varyCases'
import VaryApproveCasesPage from './varyApproveCasesPage'
import LicenceCreationType from '../../server/enumeration/licenceCreationType'
import LicenceStatus from '../../server/enumeration/licenceStatus'

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
    cy.task('stubGetCaseloadItem')
    cy.task('stubGetProbationer')
    cy.task('stubGetPrisonInformation')
    cy.task('stubGetHdcStatus')
    cy.task('stubGetResponsibleCommunityManager')
    cy.task('stubGetStaffCreateCaseload', {
      licenceStatus: LicenceStatus.NOT_STARTED,
      licenceCreationType: LicenceCreationType.LICENCE_NOT_STARTED,
    })
    cy.get(this.createLicenceTileId).click()
    return Page.verifyOnPage(CaseloadPage)
  }

  clickCreateALicenceToEdit = (): CaseloadPage => {
    cy.task('stubGetCaseloadItem')
    cy.task('stubGetProbationer')
    cy.task('stubGetPrisonInformation')
    cy.task('stubGetHdcStatus')
    cy.task('stubSearchForAddresses')
    cy.task('stubPutLicenceAppointmentPerson')
    cy.task('stubGetResponsibleCommunityManager')
    cy.task('stubGetStaffCreateCaseload', {
      licenceId: 1,
      licenceStatus: 'APPROVED',
      licenceCreationType: LicenceCreationType.LICENCE_IN_PROGRESS,
    })

    cy.get(this.createLicenceTileId).click()
    return Page.verifyOnPage(CaseloadPage)
  }

  clickCreateALicenceInHardStop = (): CaseloadPage => {
    cy.task('stubGetCaseloadItemInHardStop')
    cy.task('stubGetProbationer')
    cy.task('stubGetPrisonInformation')
    cy.task('stubGetHdcStatus')
    cy.task('stubGetResponsibleCommunityManager')

    cy.get(this.createLicenceTileId).click()
    return Page.verifyOnPage(CaseloadPage)
  }

  clickCreateAPssLicence = (): CaseloadPage => {
    cy.task('stubGetPssCaseloadItem')
    cy.task('stubGetProbationer')
    cy.task('stubGetPrisonInformation')
    cy.task('stubGetHdcStatus')
    cy.task('stubGetResponsibleCommunityManager')
    cy.task('stubGetStaffCreateCaseload', {
      licenceStatus: LicenceStatus.NOT_STARTED,
      licenceCreationType: LicenceCreationType.LICENCE_NOT_STARTED,
    })
    cy.get(this.createLicenceTileId).click()
    return Page.verifyOnPage(CaseloadPage)
  }

  clickVaryALicence = (): VaryCasesPage => {
    cy.task('stubGetComReviewCount')
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
