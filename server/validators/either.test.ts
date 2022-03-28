import { MinLength, validate, ValidationError } from 'class-validator'
import { plainToInstance } from 'class-transformer'

import * as utils from '../utils/utils'
import Either from './either'

const objectIsEmpty = jest.spyOn(utils, 'objectIsEmpty')

class TestClass {
  @Either('alternative')
  @MinLength(100)
  value: string

  alternative: string
}

describe('either', () => {
  it('should validate the field if the value is not empty', async () => {
    objectIsEmpty.mockReturnValueOnce(false)
    const value = plainToInstance(TestClass, { value: 'validate me' })
    const errors: ValidationError[] = await validate(value)

    expect(errors.length).toBe(1)
    expect(errors[0].constraints).toEqual({
      minLength: 'value must be longer than or equal to 100 characters',
    })
  })

  it('should validate the field if the value is empty and the alternative field is empty', async () => {
    objectIsEmpty.mockReturnValue(true)
    const value = plainToInstance(TestClass, { value: '', alternative: '' })
    const errors: ValidationError[] = await validate(value)

    expect(errors.length).toBe(1)
    expect(errors[0].constraints).toEqual({
      minLength: 'value must be longer than or equal to 100 characters',
    })
  })

  it('should not validate the field if the value is empty and the alternative is not empty', async () => {
    objectIsEmpty.mockReturnValueOnce(true).mockReturnValueOnce(false)
    const value = plainToInstance(TestClass, { value: '', alternative: 'alternative text entered' })
    const errors: ValidationError[] = await validate(value)

    expect(errors.length).toBe(0)
  })
})
