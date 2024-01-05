import { Moment } from 'moment'
import Page from './page'
import AdditionalConditionsQuestionPage from './additionalConditionsQuestion'
import ViewALicencePage from './viewALicence'

export default class AppointmentTimePage extends Page {
  private inductionDateId = '#date-calendarDate'

  private inductionTimeHourId = '#time-hour'

  private inductionTimeMinuteId = '#time-minute'

  private inductionTimeAmpmId = '#time-ampm'

  private continueButtonId = '[data-qa=continue]'

  private skipButtonId = '[data-qa=skip]'

  constructor() {
    super('appointment-time-page')
  }

  enterDate = (moment: Moment): AppointmentTimePage => {
    const date = moment.format('DD/MM/YYYY')
    cy.get(this.inductionDateId).type(date)
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

  clickContinueToReturn = (): ViewALicencePage => {
    cy.task('stubPutAppointmentTime')
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(ViewALicencePage)
  }

  clickSkip = (): AdditionalConditionsQuestionPage => {
    cy.get(this.skipButtonId).click()
    return Page.verifyOnPage(AdditionalConditionsQuestionPage)
  }
}
