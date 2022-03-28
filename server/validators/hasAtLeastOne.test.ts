import { validate, ValidationError } from 'class-validator'
import { plainToInstance } from 'class-transformer'
import HasAtLeastOne from './hasAtLeastOne'

class TestClass {
  @HasAtLeastOne({ message: 'Must have at least one' })
  value: string[]
}

describe('hasAtLeastOne', () => {
  it('should fail validation if the field being validated is an empty array', async () => {
    const value = plainToInstance(TestClass, { value: [] })
    const errors: ValidationError[] = await validate(value)

    expect(errors.length).toBe(1)
    expect(errors[0].constraints).toEqual({
      hasAtLeastOne: 'Must have at least one',
    })
  })

  it('should fail validation if the field being validated is null', async () => {
    const value = plainToInstance(TestClass, { value: null })
    const errors: ValidationError[] = await validate(value)

    expect(errors.length).toBe(1)
    expect(errors[0].constraints).toEqual({
      hasAtLeastOne: 'Must have at least one',
    })
  })

  it('should fail validation if the field being validated is an array of nulls', async () => {
    const value = plainToInstance(TestClass, { value: [null, null] })
    const errors: ValidationError[] = await validate(value)

    expect(errors.length).toBe(1)
    expect(errors[0].constraints).toEqual({
      hasAtLeastOne: 'Must have at least one',
    })
  })

  it('should fail validation if the field being validated is an array of empty strings', async () => {
    const value = plainToInstance(TestClass, { value: ['', ''] })
    const errors: ValidationError[] = await validate(value)

    expect(errors.length).toBe(1)
    expect(errors[0].constraints).toEqual({
      hasAtLeastOne: 'Must have at least one',
    })
  })

  it('should pass validation if the field being validated is an array with at least one non empty string', async () => {
    const value = plainToInstance(TestClass, { value: ['', 'test'] })
    const errors: ValidationError[] = await validate(value)

    expect(errors.length).toBe(0)
  })
})
