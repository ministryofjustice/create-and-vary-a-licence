import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'
import SimpleTime, { AmPm } from '../routes/creatingLicences/types/time'

@ValidatorConstraint()
export default class ValidCurfewTime implements ValidatorConstraintInterface {
  validate(simpleTime: SimpleTime): boolean {
    if (!simpleTime) return false
    return !this.getError(simpleTime)
  }

  defaultMessage(args: ValidationArguments): string {
    const simpleTime = args.value as SimpleTime
    const fieldName = args.property

    const error = this.getError(simpleTime, fieldName)

    return error || ''
  }

  private getError(time: SimpleTime, fieldName?: string): string | null {
    const hour = Number(time?.hour)
    const minute = Number(time?.minute)
    const ampm = time?.ampm

    const hasHour = this.isPresent(time?.hour)
    const hasMinute = this.isPresent(time?.minute)
    const hasAmPm = Object.values(AmPm).includes(ampm)

    const isHourValid = hasHour && hour >= 1 && hour <= 12
    const isMinuteValid = hasMinute && minute >= 0 && minute <= 59

    const isStart = fieldName?.toLowerCase().includes('start')
    const timePrefix = isStart ? 'Start time' : 'End time'

    // Case: nothing entered
    if (!hasHour && !hasMinute && !hasAmPm) {
      return `Enter ${isStart ? 'a start time' : 'an end time'}`
    }

    // Case: AMPM selected but hour/minute missing
    if (hasAmPm && !hasHour && !hasMinute) {
      return `${timePrefix} must include hours and minutes`
    }

    // Case: both hour and minute invalid and AMPM missing
    if (!isHourValid && !isMinuteValid && !hasAmPm) {
      return `${timePrefix} time must be in 12-hour clock format`
    }

    // Case: both hour and minute invalid
    if (!isHourValid && !isMinuteValid) {
      return `${timePrefix} must include an hour in 12-hour clock format and minute between 0 and 59`
    }

    // Case: invalid hour, valid minute and AMPM
    if (!isHourValid && isMinuteValid && hasAmPm) {
      return `${timePrefix} must include an hour in 12-hour clock format`
    }

    // Case: valid hour, invalid minute and AMPM
    if (isHourValid && !isMinuteValid && hasAmPm) {
      return `${timePrefix} must include a minute between 0 and 59`
    }

    // Case: valid hour/minute but AMPM missing
    if (isHourValid && isMinuteValid && !hasAmPm) {
      return `${timePrefix} must include AM or PM`
    }

    return null
  }

  private isPresent(value: string): boolean {
    return value !== '' && value !== undefined && value !== null
  }
}
