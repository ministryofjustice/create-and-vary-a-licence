import { ValidationArguments } from 'class-validator'
import ValidCurfewTime from './curfewTimeValidator'
import { SimpleTime } from '../routes/manageConditions/types'
import { AmPm } from '../routes/creatingLicences/types/time'

describe('ValidCurfewTime', () => {
  const validator = new ValidCurfewTime()

  const mockArgs = (value: SimpleTime, property: string): ValidationArguments => ({
    value,
    property,
    targetName: '',
    object: {},
    constraints: [],
  })

  test('should return false for null input', () => {
    expect(validator.validate(null)).toBe(false)
  })

  test('should return error for empty time', () => {
    const time = new SimpleTime('', '', undefined)
    const args = mockArgs(time, 'startTime')
    expect(validator.defaultMessage(args)).toBe('Enter a start time')
  })

  test('should return error for AMPM only', () => {
    const time: SimpleTime = new SimpleTime('', '', AmPm.AM)
    const args = mockArgs(time, 'endTime')
    expect(validator.defaultMessage(args)).toBe('End time must include hours and minutes')
  })

  test('should return error for invalid hour and minute without AMPM', () => {
    const time = new SimpleTime('0', '60', undefined)
    const args = mockArgs(time, 'startTime')
    expect(validator.defaultMessage(args)).toBe('Start time time must be in 12-hour clock format')
  })

  test('should return error for invalid hour and minute with AMPM', () => {
    const time = new SimpleTime('0', '60', AmPm.PM)
    const args = mockArgs(time, 'endTime')
    expect(validator.defaultMessage(args)).toBe(
      'End time must include an hour in 12-hour clock format and minute between 0 and 59',
    )
  })

  test('should return error for invalid hour only', () => {
    const time = new SimpleTime('0', '30', AmPm.AM)
    const args = mockArgs(time, 'startTime')
    expect(validator.defaultMessage(args)).toBe('Start time must include an hour in 12-hour clock format')
  })

  test('should return error for invalid minute only', () => {
    const time = new SimpleTime('10', '60', AmPm.PM)
    const args = mockArgs(time, 'endTime')
    expect(validator.defaultMessage(args)).toBe('End time must include a minute between 0 and 59')
  })

  test('should return error for missing AMPM', () => {
    const time = new SimpleTime('10', '30', undefined)
    const args = mockArgs(time, 'startTime')
    expect(validator.defaultMessage(args)).toBe('Start time must include AM or PM')
  })

  test('should validate correct time', () => {
    const time = new SimpleTime('10', '30', AmPm.AM)
    expect(validator.validate(time)).toBe(true)
  })
})
