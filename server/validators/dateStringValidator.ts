import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'
import moment from 'moment'
import type DateString from '../routes/creatingLicences/types/dateString'

@ValidatorConstraint()
export default class ValidDateString implements ValidatorConstraintInterface {
  private date: DateString

  validate(dateString: DateString): boolean {
    this.date = dateString
    return (
      !this.isBlank() &&
      this.isValidDay() &&
      this.isValidMonth() &&
      this.isValidYear() &&
      this.isValidDate() &&
      this.isOnOrAfterToday()
    )
  }

  defaultMessage(): string {
    if (this.isBlank()) return 'Enter a date'
    if (!this.isValidDay()) return 'Enter a valid day'
    if (!this.isValidMonth()) return 'Enter a valid month'
    if (!this.isValidYear()) return 'Enter a valid year'
    if (!this.isValidDate()) return 'Enter a valid date'
    if (!this.isOnOrAfterToday()) return 'Enter a date in the future'
    return null
  }

  private toMoment() {
    return moment(this.date.calendarDate, 'DD/MM/YYYY')
  }

  private isBlank(): boolean {
    return this.date.calendarDate.length === 0
  }

  private isValidDay(): boolean {
    const day = this.date.calendarDate.split('/')[0] as undefined as number
    return day >= 1 && day <= 31
  }

  private isValidMonth(): boolean {
    const month = this.date.calendarDate.split('/')[1] as undefined as number
    return month >= 1 && month <= 12
  }

  private isValidYear(): boolean {
    const year = this.date.calendarDate.split('/')[2]
    return year.length === 2 || year.length === 4
  }

  private isValidDate(): boolean {
    const dateToCheck = this.toMoment()
    return dateToCheck.isValid()
  }

  private isOnOrAfterToday(): boolean {
    return !this.toMoment().isBefore(moment().subtract(1, 'day'))
  }
}
