import CheckAnswersPage from './checkAnswers'
import Page from './page'
import StandardCurfewHoursQuestionPage from './standardCurfewHoursQuestionPage'

export default class FirstNightCurfewTimesPage extends Page {
  private continueButtonId = '[data-qa=continue]'

  private readonly startPrefix = '#curfewStart'

  private readonly endPrefix = '#curfewEnd'

  constructor() {
    super('first-night-curfew-times', false)
  }

  private readTimeByPrefix(prefix: string): Cypress.Chainable<string> {
    let hour = ''
    let minute = ''
    let ampm = ''

    return cy
      .get(`${prefix}-hour`)
      .invoke('val')
      .then(v => {
        hour = String(v)
      })
      .then(() =>
        cy
          .get(`${prefix}-minute`)
          .invoke('val')
          .then(v => {
            minute = String(v)
          }),
      )
      .then(() =>
        cy
          .get(`${prefix}-ampm`)
          .invoke('val')
          .then(v => {
            ampm = String(v)
          }),
      )
      .then(() => `${hour} ${minute} ${ampm}`)
  }

  getCurfewStartTime = (): Cypress.Chainable<string> => {
    return this.readTimeByPrefix(this.startPrefix)
  }

  getCurfewEndTime = (): Cypress.Chainable<string> => {
    return this.readTimeByPrefix(this.endPrefix)
  }

  private enterTime(prefix: string, time: { hour: string; minute: string; ampm: string }) {
    const get = (field: string) => cy.get(`${prefix}-${field}`)

    get('hour').clear()
    get('hour').type(time.hour)

    get('minute').clear()
    get('minute').type(time.minute)

    get('ampm').select('Choose am or pm')
    get('ampm').select(time.ampm)
  }

  enterFirstNightCurfewStartTime(time: { hour: string; minute: string; ampm: string }): FirstNightCurfewTimesPage {
    this.enterTime(this.startPrefix, time)
    return this
  }

  enterFirstNightCurfewEndTime(time: { hour: string; minute: string; ampm: string }): FirstNightCurfewTimesPage {
    this.enterTime(this.endPrefix, time)
    return this
  }

  clickSave = (): CheckAnswersPage => {
    cy.task('stubPutFirstNightCurfewTimes')
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(CheckAnswersPage)
  }

  clickContinue = (): StandardCurfewHoursQuestionPage => {
    cy.task('stubPutFirstNightCurfewTimes')
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(StandardCurfewHoursQuestionPage)
  }
}
