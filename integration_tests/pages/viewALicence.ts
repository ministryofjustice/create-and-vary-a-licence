import AppointmentContactPage from './appointmentContact'
import AppointmentPersonPage from './appointmentPerson'
import AppointmentPlacePage from './appointmentPlace'
import AppointmentTimePage from './appointmentTime'
import Page from './page'
import PrintLicenceHtmlPage from './printLicenceHtmlPage'

export default class ViewALicencePage extends Page {
  constructor() {
    super('print-view-page')
  }

  clickChangePersonLink = (): AppointmentPersonPage => {
    cy.get('[data-qa=person-change-link]').click()
    return Page.verifyOnPage(AppointmentPersonPage)
  }

  clickChangeAddressLink = (): AppointmentPlacePage => {
    cy.get('[data-qa=address-change-link]').click()
    return Page.verifyOnPage(AppointmentPlacePage)
  }

  clickChangeTelephoneLink = (): AppointmentContactPage => {
    cy.get('[data-qa=telephone-change-link]').click()
    return Page.verifyOnPage(AppointmentContactPage)
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
}
