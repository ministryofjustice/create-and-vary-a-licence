import { validate, ValidationError } from 'class-validator'
import { plainToClass } from 'class-transformer'
import SimpleDate from '../routes/creatingLicences/types/date'
import DateIsAfter from './dateIsAfter'

class TestClass {
  @DateIsAfter('date', { message: 'Date must be after the given date' })
  value: SimpleDate

  date = '02/02/2020'
}

describe('dateIsAfter', () => {
  it('should fail validation if the date being validated is before the given date', async () => {
    const value = plainToClass(TestClass, { value: new SimpleDate('22', '03', '2019') })
    const errors: ValidationError[] = await validate(value)

    expect(errors.length).toBe(1)
    expect(errors[0].constraints).toEqual({
      dateIsAfter: 'Date must be after the given date',
    })
  })

  it('should pass validation if the date being validated is equal to the given date', async () => {
    const value = plainToClass(TestClass, { value: new SimpleDate('02', '02', '2020') })
    const errors: ValidationError[] = await validate(value)

    expect(errors.length).toBe(0)
  })

  it('should pass validation if the date being validated is after the given date', async () => {
    const value = plainToClass(TestClass, { value: new SimpleDate('22', '03', '2021') })
    const errors: ValidationError[] = await validate(value)

    expect(errors.length).toBe(0)
  })
})
