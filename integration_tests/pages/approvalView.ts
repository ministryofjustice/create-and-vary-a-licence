import Page from './page'
import ConfirmApprovePage from './confirmApprove'
import ConfirmRejectPage from './confirmReject'
import ApprovalCasesPage from './approvalCases'

export default class ApprovalViewPage extends Page {
  private approveLicenceButtonId = '[data-qa=approve-licence]'

  private rejectLicenceButtonId = '[data-qa=reject-licence]'

  private returnToListButtonId = '[data-qa=return-to-case-list]'

  private prisonerImageId = '[data-qa=prisoner-image]'

  private prisonerMissingImageId = '[data-qa=prisoner-missing-image]'

  public approveLicenceId = '#approve-licence-heading'

  public approveLicenceAndPssId = '#approve-licence-and-pss-heading'

  public approvePssId = '#approve-pss-heading'

  public accordionSectionHeading = '.govuk-accordion__section-heading-text-focus'

  getHideAllSection = () => {
    return cy.get('.govuk-accordion__show-all-text')
  }

  constructor() {
    super('approval-view-page', true, { 'aria-allowed-attr': { enabled: false } })
  }

  getPrisonerImage = () => {
    return cy.get(this.prisonerImageId)
  }

  getPrisonerMissingImageId = () => {
    return cy.get(this.prisonerMissingImageId)
  }

  clickApprove = (): ConfirmApprovePage => {
    cy.get(this.approveLicenceButtonId).click()
    return Page.verifyOnPage(ConfirmApprovePage)
  }

  clickReturnToList = (): ApprovalCasesPage => {
    cy.get(this.returnToListButtonId).click()
    return Page.verifyOnPage(ApprovalCasesPage)
  }

  clickReject = (): ConfirmRejectPage => {
    // Force: true will click even if a hidden element
    cy.get(this.rejectLicenceButtonId).click({ force: true })
    return Page.verifyOnPage(ConfirmRejectPage)
  }

  getValue = id => {
    return cy.get(id)
  }
}
