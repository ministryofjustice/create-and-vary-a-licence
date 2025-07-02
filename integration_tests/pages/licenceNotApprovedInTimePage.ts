import Page from './page'

export default class LicenceNotApprovedInTimePage extends Page {
  constructor() {
    super('licence-not-approved-in-time-page')
  }

  checkIfElectronicMonitoringProviderExists = () => {
    cy.get('#electronicMonitoringProvider-isToBeTaggedForProgramme').should('exist')
    return this
  }
}
