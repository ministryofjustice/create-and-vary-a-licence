import { Moment } from 'moment'
import Page from './page'
import AdditionalConditionsQuestionPage from './additionalConditionsQuestion'

export default class AppointmentTimePage extends Page {
  private inductionDateDayId = '#date-day'

  private inductionDateMonthId = '#date-month'

  private inductionDateYearId = '#date-year'

  private inductionTimeHourId = '#time-hour'

  private inductionTimeMinuteId = '#time-minute'

  private inductionTimeAmpmId = '#time-ampm'

  private continueButtonId = '[data-qa=continue]'

  constructor() {
    super('appointment-time-page')
  }

  enterDate = (moment: Moment): AppointmentTimePage => {
    cy.get(this.inductionDateDayId).type(moment.date().toString())
    cy.get(this.inductionDateMonthId).type((moment.month() + 1).toString())
    cy.get(this.inductionDateYearId).type(moment.year().toString())
    return this
  }

  enterTime = (moment: Moment): AppointmentTimePage => {
    const time = moment.format('hh mm a')
    cy.get(this.inductionTimeHourId).type(time.split(' ')[0])
    cy.get(this.inductionTimeMinuteId).type(time.split(' ')[1])
    cy.get(this.inductionTimeAmpmId).select(time.split(' ')[2])
    return this
  }

  clickContinue = (): AdditionalConditionsQuestionPage => {
    cy.task('stubPutAppointmentTime')
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(AdditionalConditionsQuestionPage)
  }
}
