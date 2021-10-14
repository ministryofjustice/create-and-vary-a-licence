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
    cy.get(this.createLicenceTileId).click()
    return Page.verifyOnPage(CaseloadPage)
  }

  clickApproveALicence = (): ApprovalCasesPage => {
    cy.get(this.approveLicenceTileId).click()
    return Page.verifyOnPage(ApprovalCasesPage)
  }
}
