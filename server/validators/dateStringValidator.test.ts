import moment from 'moment'
import { plainToInstance } from 'class-transformer'
import { format, addDays } from 'date-fns'
import DateString from '../routes/creatingLicences/types/dateString'
import ValidDateString from './dateStringValidator'

describe('Validators - ValidDateString', () => {
  let validator: ValidDateString
  let date: DateString

  beforeEach(() => {
    validator = new ValidDateString()
    date = plainToInstance(
      DateString,
      { calendarDate: format(addDays(new Date(), 1), 'dd/MM/yyyy') },
      { excludeExtraneousValues: true },
    )
  })

  it('should pass validation with well formed data', () => {
    expect(validator.validate(date)).toBe(true)
  })

  it('should fail validation when blank', () => {
    date.calendarDate = ''
    expect(validator.validate(date)).toBe(false)
    expect(validator.defaultMessage()).toBe('Enter a date')
  })

  it('should fail validation with badly formed day', () => {
    date.calendarDate = '40/12/2023'
    expect(validator.validate(date)).toBe(false)
    expect(validator.defaultMessage()).toBe('Enter a valid day')
  })

  it('should fail validation with badly formed month', () => {
    date.calendarDate = '01/13/2023'
    expect(validator.validate(date)).toBe(false)
    expect(validator.defaultMessage()).toBe('Enter a valid month')
  })

  it('should fail validation with badly formed year', () => {
    date.calendarDate = '01/12/123'
    expect(validator.validate(date)).toBe(false)
    expect(validator.defaultMessage()).toBe('Enter a valid year')
  })

  it('should fail validation with a non existing date', () => {
    date.calendarDate = '29/02/23'
    expect(validator.validate(date)).toBe(false)
    expect(validator.defaultMessage()).toBe('Enter a valid date')
  })

  it('should fail validation with a date in the past', () => {
    date.calendarDate = '23/02/19'
    expect(validator.validate(date)).toBe(false)
    expect(validator.defaultMessage()).toBe('Enter a date in the future')
  })

  it("should fail validation with yesterday's date", () => {
    const today = moment()
    date.calendarDate = moment(today).subtract(1, 'day').format('DD/MM/YYYY')
    expect(validator.validate(date)).toBe(false)
    expect(validator.defaultMessage()).toBe('Enter a date in the future')
  })

  it("should pass validation with today's date", () => {
    const today = moment()
    date.calendarDate = moment(today).format('DD/MM/YYYY')
    expect(validator.validate(date)).toBe(true)
  })

  it('should return null as default message', () => {
    validator.validate(date)
    expect(validator.defaultMessage()).toBe(null)
  })
})
