import { validate, ValidationError } from 'class-validator'
import { Expose, plainToClass } from 'class-transformer'
import DoesNotContainMarkup from './doesNotContainMarkup'

class TestClass {
  @Expose()
  @DoesNotContainMarkup({ message: 'Markup disallowed' })
  addressLine: string
}

describe('Disallow markup validation', () => {
  it('should pass validation for address fields containing no markup', async () => {
    const value = plainToClass(TestClass, { addressLine: 'Somewhere valid' })
    const errors: ValidationError[] = await validate(value)
    expect(errors.length).toBe(0)
  })

  it('should fail validation when markup appears in an address field', async () => {
    const value = plainToClass(TestClass, { addressLine: '<a>hello</a>Somewhere invalid' })
    const errors: ValidationError[] = await validate(value)
    expect(errors.length).toBe(1)
    expect(errors[0].constraints).toEqual({
      doesNotContainMarkup: 'Markup disallowed',
    })
  })
})
