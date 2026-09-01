import { validate, ValidationError } from 'class-validator'
import { plainToInstance } from 'class-transformer'
import SimpleDate from '../routes/creatingLicences/types/date'
import DateIsStrictlyAfter from './dateIsStrictlyAfter'

class TestClass {
  @DateIsStrictlyAfter('date', { message: 'Date must be strictly after the given date' })
  value: SimpleDate

  date = '02/02/2020'
}

describe('dateIsStrictlyAfter', () => {
  it('should fail validation if the date being validated is before the given date', async () => {
    const value = plainToInstance(TestClass, { value: new SimpleDate('22', '03', '2019') })
    const errors: ValidationError[] = await validate(value)

    expect(errors.length).toBe(1)
    expect(errors[0].constraints).toEqual({
      dateIsStrictlyAfter: 'Date must be strictly after the given date',
    })
  })

  it('should fail validation if the date being validated is equal to the given date', async () => {
    const value = plainToInstance(TestClass, { value: new SimpleDate('02', '02', '2020') })
    const errors: ValidationError[] = await validate(value)

    expect(errors.length).toBe(1)
    expect(errors[0].constraints).toEqual({
      dateIsStrictlyAfter: 'Date must be strictly after the given date',
    })
  })

  it('should pass validation if the date being validated is after the given date', async () => {
    const value = plainToInstance(TestClass, { value: new SimpleDate('22', '03', '2021') })
    const errors: ValidationError[] = await validate(value)

    expect(errors).toHaveLength(0)
  })

  it('should throw an error if the comparison date is invalid', async () => {
    class InvalidDateTestClass extends TestClass {
      date = 'invalid-date'
    }

    const value = plainToInstance(InvalidDateTestClass, { value: new SimpleDate('22', '03', '2021') })

    await expect(Promise.resolve().then(() => validate(value))).rejects.toThrow(
      'Date to compare is not in a valid date format: date - invalid-date',
    )
  })
})
