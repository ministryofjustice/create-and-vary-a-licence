import Page from './page'

export default class FirstNightCurfewTimesPage extends Page {
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
}
