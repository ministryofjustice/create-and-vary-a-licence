import Page from './page'
import TimelinePage from './timelinePage'

export default class VaryCasesPage extends Page {
  private varyLicenceLinkId = '#name-link-1'

  private urgentHighlightMessageClass = '.urgent-highlight-message'

  private licenceStatusId = '#licence-status-'

  private probationPractitionerId = '#probation-practitioner-'

  public myCount = '#my-count'

  public teamCount = '#team-count'

  constructor() {
    super('vary-cases-page')
  }

  selectCase = (): TimelinePage => {
    cy.get(this.varyLicenceLinkId).click()
    return Page.verifyOnPage(TimelinePage)
  }

  getValue = id => {
    return cy.get(id)
  }

  getUrgentHighlightMessage = () => cy.get(this.urgentHighlightMessageClass)

  getLicenceStatusByIndex = (index: number) => cy.get(this.licenceStatusId + index)

  getProbationPractitioner = (index: number) => cy.get(this.probationPractitionerId + index)
}
