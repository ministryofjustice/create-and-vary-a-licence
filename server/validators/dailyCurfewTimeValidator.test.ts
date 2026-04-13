import { ValidationArguments } from 'class-validator'
import { SimpleTime } from '../routes/manageConditions/types'
import { AmPm } from '../routes/creatingLicences/types/time'
import ValidDailyCurfewTime from './dailyCurfewTimeValidator'

describe('ValidDailyCurfewTime', () => {
  const validator = new ValidDailyCurfewTime()

  const mockArgs = (value: SimpleTime, property: string): ValidationArguments => ({
    value,
    property,
    targetName: '',
    object: {
      startDay: 'WEDNESDAY',
      endDay: 'THURSDAY',
    },
    constraints: [],
  })

  test('should return false for null input', () => {
    expect(validator.validate(null)).toBe(false)
  })

  test('should return error for empty time', () => {
    const time = new SimpleTime('', '', undefined)
    const args = mockArgs(time, 'startTime')
    expect(validator.defaultMessage(args)).toBe('For the curfew starting Wednesday, enter a start time')
  })

  test('should return error for AMPM only', () => {
    const time: SimpleTime = new SimpleTime('', '', AmPm.AM)
    const args = mockArgs(time, 'endTime')
    expect(validator.defaultMessage(args)).toBe(
      'For the curfew starting Wednesday, end time must include hours and minutes',
    )
  })

  test('should return error for invalid hour and minute without AMPM', () => {
    const time = new SimpleTime('0', '60', undefined)
    const args = mockArgs(time, 'startTime')
    expect(validator.defaultMessage(args)).toBe(
      'For the curfew starting Wednesday, start time must be in 12-hour clock format',
    )
  })

  test('should return error for invalid hour and minute with AMPM', () => {
    const time = new SimpleTime('0', '60', AmPm.PM)
    const args = mockArgs(time, 'endTime')
    expect(validator.defaultMessage(args)).toBe(
      'For the curfew starting Wednesday, end time must include an hour in 12-hour clock format and minutes between 0 and 59',
    )
  })

  test('should return error for invalid hour only', () => {
    const time = new SimpleTime('0', '30', AmPm.AM)
    const args = mockArgs(time, 'startTime')
    expect(validator.defaultMessage(args)).toBe(
      'For the curfew starting Wednesday, start time must include an hour in 12-hour clock format',
    )
  })

  test('should return error for invalid minute only', () => {
    const time = new SimpleTime('10', '60', AmPm.PM)
    const args = mockArgs(time, 'endTime')
    expect(validator.defaultMessage(args)).toBe(
      'For the curfew starting Wednesday, end time must include minutes between 0 and 59',
    )
  })

  test('should return error for missing AMPM', () => {
    const time = new SimpleTime('10', '30', undefined)
    const args = mockArgs(time, 'startTime')
    expect(validator.defaultMessage(args)).toBe('For the curfew starting Wednesday, start time must include am or pm')
  })

  test('should validate correct time', () => {
    const time = new SimpleTime('10', '30', AmPm.AM)
    expect(validator.validate(time)).toBe(true)
  })
})
