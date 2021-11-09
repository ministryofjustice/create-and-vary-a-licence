import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'
import SimpleTime, { AmPm } from '../routes/creatingLicences/types/time'

@ValidatorConstraint()
export default class ValidSimpleTime implements ValidatorConstraintInterface {
  private time: SimpleTime

  validate(simpleTime: SimpleTime): boolean {
    this.time = simpleTime
    return !this.isBlank() && this.isValidHour() && this.isValidMinute() && this.isValidAmPm()
  }

  defaultMessage(): string {
    if (this.isBlank()) return 'Enter a time'
    if (!this.isValidHour()) return 'Enter an hour between 1 and 12'
    if (!this.isValidMinute()) return 'Enter a minute between 00 and 59'
    if (!this.isValidAmPm()) return 'Select either Am or Pm'
    return null
  }

  private isBlank(): boolean {
    return this.time && [this.time.hour, this.time.minute].join('').length === 0
  }

  private isValidHour(): boolean {
    const hour = this.time.hour as unknown as number
    return this.time.hour !== '' && hour >= 1 && hour <= 12
  }

  private isValidMinute(): boolean {
    const minute = this.time.minute as unknown as number
    return this.time.minute !== '' && minute >= 0 && minute <= 59
  }

  private isValidAmPm(): boolean {
    return Object.values(AmPm).includes(this.time.ampm)
  }
}
