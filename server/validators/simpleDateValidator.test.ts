import { plainToInstance } from 'class-transformer'
import { ValidationArguments } from 'class-validator'
import SimpleDate from '../routes/creatingLicences/types/date'
import ValidSimpleDate from './simpleDateValidator'

describe('Validators - ValidSimpleDate', () => {
  let validator: ValidSimpleDate
  let date: SimpleDate

  beforeEach(() => {
    validator = new ValidSimpleDate()
    date = plainToInstance(
      SimpleDate,
      {
        day: '31',
        month: '12',
        year: new Date().getFullYear().toString(),
      },
      { excludeExtraneousValues: true },
    )
  })

  it('should pass validation with well formed data', () => {
    expect(validator.validate(date)).toBe(true)
  })

  it('should fail validation when all fields are blank', () => {
    date.day = ''
    date.month = ''
    date.year = ''
    expect(validator.validate(date)).toBe(false)
    expect(validator.defaultMessage()).toBe('Enter a date')
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

  it('should fail validation with a non existing date', () => {
    date.day = '29'
    date.month = '02'
    date.year = '23'
    expect(validator.validate(date)).toBe(false)
    expect(validator.defaultMessage()).toBe('Enter a valid date')
  })

  it('should fail validation with a date in the past', () => {
    date.day = '23'
    date.month = '02'
    date.year = '19'
    expect(validator.validate(date)).toBe(false)
    expect(validator.defaultMessage()).toBe('Enter a date in the future')
  })

  it("should fail validation with yesterday's date", () => {
    const today = new Date('2020-03-1')
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    date.day = yesterday.getDate().toString()
    date.month = (yesterday.getMonth() + 1).toString()
    date.year = yesterday.getFullYear().toString()
    expect(validator.validate(date)).toBe(false)
    expect(validator.defaultMessage()).toBe('Enter a date in the future')
  })

  it("should pass validation with yesterday's date if past dates are explicitly allowed", () => {
    const today = new Date('2020-03-1')
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    date.day = yesterday.getDate().toString()
    date.month = (yesterday.getMonth() + 1).toString()
    date.year = yesterday.getFullYear().toString()
    const validationArguments: ValidationArguments = {
      value: null,
      constraints: [{ pastAllowed: true }],
      targetName: '',
      object: undefined,
      property: '',
    }
    expect(validator.validate(date, validationArguments)).toBe(true)
  })

  it("should pass validation with today's date", () => {
    const today = new Date()
    date.day = today.getDate().toString()
    date.month = (today.getMonth() + 1).toString()
    date.year = today.getFullYear().toString()
    expect(validator.validate(date)).toBe(true)
  })

  it('should return null as default message', () => {
    validator.validate(date)
    expect(validator.defaultMessage()).toBe(null)
  })
})
