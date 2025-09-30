import AppointmentContactPage from './appointmentContact'
import AppointmentPersonPage from './appointmentPerson'
import AppointmentTimePage from './appointmentTime'
import Page from './page'
import PrintLicenceHtmlPage from './printLicenceHtmlPage'
import CaSearchPage from './caSearch'
import ManualAddressEntryPage from './manualAddressEntryPage'
import ViewCasesPage from './viewCasesPage'

export default class ViewALicencePage extends Page {
  constructor() {
    super('print-view-page')
  }

  clickChangePersonLink = (): AppointmentPersonPage => {
    cy.get('[data-qa=person-change-link]').click()
    return Page.verifyOnPage(AppointmentPersonPage)
  }

  clickChangeAddressLink = (): ManualAddressEntryPage => {
    cy.get('[data-qa=address-change-link]').click()
    return Page.verifyOnPage(ManualAddressEntryPage)
  }

  clickChangeTelephoneLink = (): AppointmentContactPage => {
    cy.get('[data-qa=telephone-change-link]').click()
    return Page.verifyOnPage(AppointmentContactPage)
  }

  clickChangeAlternativeTelephoneLink = (): AppointmentContactPage => {
    cy.get('[data-qa=alternative-telephone-change-link]').click()
    return Page.verifyOnPage(AppointmentContactPage)
  }

  checkAlternativeTelephoneNotEntered() {
    cy.get('.govuk-summary-list__row')
      .contains('dt.govuk-summary-list__key', 'Alternative contact phone number')
      .siblings('dd.govuk-summary-list__value')
      .should('contain.text', 'Not entered')
  }

  checkTelephoneNotEntered() {
    cy.get('.govuk-summary-list__row')
      .contains('dt.govuk-summary-list__key', 'Contact phone number')
      .siblings('dd.govuk-summary-list__value')
      .should('contain.text', 'Not yet entered')
  }

  checkTelephoneEntered(telephone: string) {
    cy.get('.govuk-summary-list__row')
      .contains('dt.govuk-summary-list__key', 'Contact phone number')
      .siblings('dd.govuk-summary-list__value')
      .should('contain.text', telephone)
  }

  checkAlternativeTelephoneEntered(telephone: string) {
    cy.get('.govuk-summary-list__row')
      .contains('dt.govuk-summary-list__key', 'Alternative contact phone number')
      .siblings('dd.govuk-summary-list__value')
      .should('contain.text', telephone)
  }

  checkAlternativeTelephoneLinkDoesExist() {
    cy.get('[data-qa=alternative-telephone-change-link]').should('exist')
  }

  clickChangeDateLink = (): AppointmentTimePage => {
    cy.get('[data-qa=date-change-link]').click()
    return Page.verifyOnPage(AppointmentTimePage)
  }

  clickChangeTimeLink = (): AppointmentTimePage => {
    cy.get('[data-qa=time-change-link]').click()
    return Page.verifyOnPage(AppointmentTimePage)
  }

  printALicence = (): PrintLicenceHtmlPage => {
    // This checks the print button and overrides its attributes to reference a html page rather than a PDF
    cy.contains('a', 'View and print licence PDF')
      .should($a => {
        expect($a.attr('href'), 'href').to.equal('/licence/view/id/1/pdf-print')
        expect($a.attr('target'), 'target').to.equal('_blank')
        $a.attr('target', '_self')
        $a.attr('href', '/licence/view/id/1/html-print')
      })
      .click()
    return Page.verifyOnPage(PrintLicenceHtmlPage)
  }

  clickBackToCaSearch = (): CaSearchPage => {
    cy.get('.govuk-back-link').click()
    return Page.verifyOnPage(CaSearchPage)
  }

  checkElectronicMonitoringAdditionalInformationExists = () => {
    cy.get('#electronicMonitoringProvider-isToBeTaggedForProgramme').should('exist')
    return this
  }

  checkIfElectronicMonitoringAdditionalInformationDoesNotExist = () => {
    cy.get('#electronicMonitoringProvider-isToBeTaggedForProgramme').should('not.exist')
    return this
  }

  clickBackToViewCases = (): ViewCasesPage => {
    cy.get('.govuk-back-link').click()
    return Page.verifyOnPage(ViewCasesPage)
  }
}
