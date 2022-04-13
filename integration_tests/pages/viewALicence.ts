import Page from './page'
import PrintLicenceHtmlPage from './printLicenceHtmlPage'

export default class ViewALicencePage extends Page {
  constructor() {
    super('print-view-page')
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
