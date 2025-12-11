import { Moment } from 'moment'
import Page from './page'
import AdditionalConditionsQuestionPage from './additionalConditionsQuestion'
import ViewALicencePage from './viewALicence'
import PssConditionsQuestionPage from './pssConditionsQuestion'

export default class AppointmentTimePage extends Page {
  private inductionDateId = '#date-calendarDate'

  private inductionTimeHourId = '#time-hour'

  private inductionTimeMinuteId = '#time-minute'

  private inductionTimeAmpmId = '#time-ampm'

  private continueButtonId = '[data-qa=continue]'

  private skipButtonId = '[data-qa=skip]'

  constructor() {
    super('appointment-time-page', true, { 'aria-allowed-attr': { enabled: false } })
  }

  selectType = (value: string): AppointmentTimePage => {
    cy.task('stubGetCompletedLicence', { statusCode: 'IN_PROGRESS', typeCode: 'AP_PSS', appointmentTimeType: value })
    cy.get(`input[value="${value}"]`).click()
    return this
  }

  selectTypePss = (value: string): AppointmentTimePage => {
    cy.task('stubGetCompletedLicence', { statusCode: 'IN_PROGRESS', typeCode: 'PSS', appointmentTimeType: value })
    cy.get(`input[value="${value}"]`).click()
    return this
  }

  selectTypeInHardStop = (value: string): AppointmentTimePage => {
    cy.task('stubGetCompletedLicence', {
      statusCode: 'IN_PROGRESS',
      typeCode: 'AP_PSS',
      appointmentTimeType: value,
      isInHardStopPeriod: true,
      kind: 'TIME_SERVED',
      appointmentTelephoneNumber: '01234567890',
      appointmentAlternativeTelephoneNumber: '09876543210',
    })
    cy.get(`input[value="${value}"]`).click()
    return this
  }

  enterDate = (moment: Moment): AppointmentTimePage => {
    const date = moment.format('DD/MM/YYYY')
    cy.get(this.inductionDateId).clear()
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

  clickContinueToPss = (): PssConditionsQuestionPage => {
    cy.task('stubPutAppointmentTime')
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(PssConditionsQuestionPage)
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

  getRadioByValue = (type: string) => {
    return cy.get(`input[value="${type}"]`)
  }

  getEarlyReleaseWarning() {
    return cy.get('.govuk-warning-text__text')
  }
}
