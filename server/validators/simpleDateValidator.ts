import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'
import moment from 'moment'
import SimpleDate from '../routes/creatingLicences/types/date'

@ValidatorConstraint()
export default class ValidSimpleDate implements ValidatorConstraintInterface {
  private date: SimpleDate

  private pastAllowed: boolean = false

  validate(simpleDate: SimpleDate, args?: ValidationArguments): boolean {
    this.date = simpleDate
    this.pastAllowed = args?.constraints?.[0]?.pastAllowed ?? false
    return (
      !this.isBlank() &&
      this.isValidDay() &&
      this.isValidMonth() &&
      this.isValidYear() &&
      this.isValidDate() &&
      (this.isOnOrAfterToday() || this.pastAllowed)
    )
  }

  defaultMessage(): string {
    if (this.isBlank()) return 'Enter a date'
    if (!this.isValidDay()) return 'Enter a valid day'
    if (!this.isValidMonth()) return 'Enter a valid month'
    if (!this.isValidYear()) return 'Enter a valid year'
    if (!this.isValidDate()) return 'Enter a valid date'
    if (!this.isOnOrAfterToday() && !this.pastAllowed) return 'Enter a date in the future'
    return null
  }

  private isBlank(): boolean {
    return [this.date.day, this.date.month, this.date.year].join('').length === 0
  }

  private isValidDay(): boolean {
    const day = this.date.day as unknown as number
    return day >= 1 && day <= 31
  }

  private isValidMonth(): boolean {
    const month = this.date.month as unknown as number
    return month >= 1 && month <= 12
  }

  private isValidYear(): boolean {
    const { year } = this.date
    return year.length === 2 || year.length === 4
  }

  private isValidDate(): boolean {
    const dateToCheck = this.date.toMoment()
    return dateToCheck.isValid()
  }

  private isOnOrAfterToday(): boolean {
    return !this.date.toMoment().isBefore(moment().subtract(1, 'day'))
  }
}
