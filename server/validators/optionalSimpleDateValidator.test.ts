import { plainToInstance } from 'class-transformer'
import SimpleDate from '../routes/creatingLicences/types/date'
import ValidOptionalSimpleDate from './optionalSimpleDateValidator'

describe('Validators - ValidOptionalSimpleDate', () => {
  let validator: ValidOptionalSimpleDate
  let date: SimpleDate

  beforeEach(() => {
    validator = new ValidOptionalSimpleDate()
    date = plainToInstance(
      SimpleDate,
      {
        day: '31',
        month: '12',
        year: new Date().getFullYear().toString(),
      },
      { excludeExtraneousValues: true }
    )
  })

  it('should pass validation with well formed data', () => {
    expect(validator.validate(date)).toBe(true)
  })

  it('should pass validation when all fields are blank', () => {
    date.day = ''
    date.month = ''
    date.year = ''
    expect(validator.validate(date)).toBe(true)
  })

  it('should fail validation with badly formed day', () => {
    date.day = '40'
    expect(validator.validate(date)).toBe(false)
    expect(validator.defaultMessage()).toBe('Enter a valid day')
  })

  it('should fail validation with badly formed month', () => {
    date.month = '13'
    expect(validator.validate(date)).toBe(false)
    expect(validator.defaultMessage()).toBe('Enter a valid month')
  })

  it('should fail validation with badly formed year', () => {
    date.year = '123'
    expect(validator.validate(date)).toBe(false)
    expect(validator.defaultMessage()).toBe('Enter a valid year')
  })

  it('should fail validation with a invalid date', () => {
    date.day = '29'
    date.month = '02'
    date.year = '23'
    expect(validator.validate(date)).toBe(false)
    expect(validator.defaultMessage()).toBe('Enter a valid date')
  })

  it('should return null as default message', () => {
    validator.validate(date)
    expect(validator.defaultMessage()).toBe(null)
  })
})
