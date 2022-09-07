import Page from './page'
import ApprovalViewPage from './approvalView'
import ChangeLocationPage from './changeLocationPage'

export default class ApprovalCasesPage extends Page {
  private approveLicenceButtonId = '#name-1 a'

  private changeLocationsLink = '[data-qa=change-location-link]'

  constructor() {
    super('approval-cases-page')
  }

  clickApproveLicence = (): ApprovalViewPage => {
    cy.get(this.approveLicenceButtonId).click()
    return Page.verifyOnPage(ApprovalViewPage)
  }

  clickChangeLocationsLink = (): ChangeLocationPage => {
    cy.get(this.changeLocationsLink).click()
    return Page.verifyOnPage(ChangeLocationPage)
  }

  getCaseloadNames = () => {
    return cy.get('[data-qa=caseload-names]')
  }

  getChangeCaseloadOption = () => {
    return cy.get('[data-qa=change-caseload]')
  }

  getTableRows = () => {
    return cy.get('tbody tr')
  }
}
