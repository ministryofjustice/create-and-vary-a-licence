import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'
import SimpleDate from '../routes/creatingLicences/types/date'

@ValidatorConstraint()
export default class ValidOptionalSimpleDate implements ValidatorConstraintInterface {
  private date: SimpleDate

  validate(simpleDate: SimpleDate): boolean {
    this.date = simpleDate
    if (!this.date.day && !this.date.month && !this.date.year) {
      return true
    }
    return this.isValidDay() && this.isValidMonth() && this.isValidYear() && this.isValidDate()
  }

  defaultMessage(): string {
    if (!this.isValidDay()) return 'Enter a valid day'
    if (!this.isValidMonth()) return 'Enter a valid month'
    if (!this.isValidYear()) return 'Enter a valid year'
    if (!this.isValidDate()) return 'Enter a valid date'
    return null
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
}
