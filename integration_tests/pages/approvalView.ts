import Page from './page'
import ApprovalSearchPage from './approvalSearch'
import ConfirmApprovePage from './confirmApprove'
import ConfirmRejectPage from './confirmReject'

export default class ApprovalViewPage extends Page {
  private approveLicenceButtonId = '[data-qa=approve-licence]'

  private rejectLicenceButtonId = '[data-qa=reject-licence]'

  private prisonerImageId = '[data-qa=prisoner-image]'

  public approveLicenceId = '#approve-licence-heading'

  public approveLicenceAndPssId = '#approve-licence-and-pss-heading'

  public approvePssId = '#approve-pss-heading'

  public accordionSectionHeading = '.govuk-accordion__section-heading-text-focus'

  public hdcEndDate = '.hdc-end-date'

  public conditionalReleaseDate = '.conditional-release-date'

  public releaseDateHeading = '.release-date-heading'

  public curfewAddress = '.curfew-address'

  public firstNightCurfewHours = '.first-night-curfew-hours'

  public curfewHours = '.curfew-hours'

  getHideAllSection = () => {
    return cy.get('.govuk-accordion__show-all-text')
  }

  constructor() {
    super('approval-view-page', true, { 'aria-prohibited-attr': { enabled: false } })
  }

  getPrisonerImage = () => {
    return cy.get(this.prisonerImageId)
  }

  clickApprove = (): ConfirmApprovePage => {
    cy.get(this.approveLicenceButtonId).click()
    return Page.verifyOnPage(ConfirmApprovePage)
  }

  clickReject = (): ConfirmRejectPage => {
    // Force: true will click even if a hidden element
    cy.get(this.rejectLicenceButtonId).click({ force: true })
    return Page.verifyOnPage(ConfirmRejectPage)
  }

  clickBackToPrisonApproverSearch = (): ApprovalSearchPage => {
    cy.get('.govuk-back-link').click()
    return Page.verifyOnPage(ApprovalSearchPage)
  }

  getValue = id => {
    return cy.get(id)
  }

  clickProbationPractitionerDetails = (): void => {
    cy.contains('button', /Community probation practitioner details/i).click()
  }

  checkProbationPractitionerDetailsNotAllocated = (): void => {
    cy.contains('Not allocated yet')
  }

  checkCorrectContactMessage = (): void => {
    cy.get('[data-qa=prison-created-contact-message]').contains(
      'Contact John Smith if you need more information about something.',
    )
    cy.get('[data-qa=prison-created-contact-message]').contains(
      'They will only be able to change the initial appointment.',
    )
  }
}
