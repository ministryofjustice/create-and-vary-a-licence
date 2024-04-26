import Page from './page'
import ViewActiveLicencePage from './viewActiveLicencePage'

export default class TimelinePage extends Page {
  constructor() {
    super('view-timeline-page')
  }

  checkTimelineContent = (): TimelinePage => {
    cy.get('.moj-timeline__title').should('contain', 'Licence created')
    cy.get('.moj-timeline__byline').should('contain', 'by John Smith')
    cy.get('.moj-timeline__date').should('be.visible').should('contain', '10th September 2021 at 10:00 am')
    return this
  }

  selectVary = (): ViewActiveLicencePage => {
    cy.get('[data-qa=view-or-vary-licence]:first').click()
    return Page.verifyOnPage(ViewActiveLicencePage)
  }
}
