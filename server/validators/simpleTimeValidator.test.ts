import { plainToClass } from 'class-transformer'
import SimpleTime, { AmPm } from '../routes/creatingLicences/types/time'
import ValidSimpleTime from './simpleTimeValidator'

describe('Validators - ValidSimpleTime', () => {
  let validator: ValidSimpleTime
  let time: SimpleTime

  beforeEach(() => {
    validator = new ValidSimpleTime()
    time = plainToClass(
      SimpleTime,
      {
        hour: '01',
        minute: '59',
        ampm: 'am',
      },
      { excludeExtraneousValues: true }
    )
  })

  it('should pass validation with well formed data', () => {
    expect(validator.validate(time)).toBe(true)
  })

  it('should fail validation when time field is undefined', () => {
    time = undefined
    expect(validator.validate(time)).toBe(false)
    expect(validator.defaultMessage()).toBe('Enter a time')
  })

  it('should fail validation when all fields are blank', () => {
    time.hour = ''
    time.minute = ''
    time.ampm = <AmPm>''
    expect(validator.validate(time)).toBe(false)
    expect(validator.defaultMessage()).toBe('Enter a time')
  })

  it('should fail validation with a badly formed hour', () => {
    time.hour = '13'
    expect(validator.validate(time)).toBe(false)
    expect(validator.defaultMessage()).toBe('Enter an hour between 1 and 12')
  })

  it('should fail validation with an empty hour', () => {
    time.hour = ''
    expect(validator.validate(time)).toBe(false)
    expect(validator.defaultMessage()).toBe('Enter an hour between 1 and 12')
  })

  it('should fail validation with a badly formed minute', () => {
    time.minute = '70'
    expect(validator.validate(time)).toBe(false)
    expect(validator.defaultMessage()).toBe('Enter a minute between 00 and 59')
  })

  it('should fail validation with an empty minute', () => {
    time.minute = ''
    expect(validator.validate(time)).toBe(false)
    expect(validator.defaultMessage()).toBe('Enter a minute between 00 and 59')
  })

  it('should return null as default message', () => {
    validator.validate(time)
    expect(validator.defaultMessage()).toBe(null)
  })
})
