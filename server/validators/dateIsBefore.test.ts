import { validate, ValidationError } from 'class-validator'
import { plainToInstance } from 'class-transformer'
import SimpleDate from '../routes/creatingLicences/types/date'
import DateIsBefore from './dateIsBefore'

class TestClass {
  @DateIsBefore('date', { message: 'Date must be before the given date' })
  value: SimpleDate

  date = '02/02/2020'
}

describe('dateIsBefore', () => {
  it('should fail validation if the date being validated is after the given date', async () => {
    const value = plainToInstance(TestClass, { value: new SimpleDate('22', '03', '2021') })
    const errors: ValidationError[] = await validate(value)

    expect(errors.length).toBe(1)
    expect(errors[0].constraints).toEqual({
      dateIsBefore: 'Date must be before the given date',
    })
  })

  it('should pass validation if the date being validated is equal to the given date', async () => {
    const value = plainToInstance(TestClass, { value: new SimpleDate('02', '02', '2020') })
    const errors: ValidationError[] = await validate(value)

    expect(errors.length).toBe(0)
  })

  it('should pass validation if the date being validated is before the given date', async () => {
    const value = plainToInstance(TestClass, { value: new SimpleDate('22', '03', '2019') })
    const errors: ValidationError[] = await validate(value)

    expect(errors.length).toBe(0)
  })
})
