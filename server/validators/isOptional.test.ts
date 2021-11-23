import { MinLength, validate, ValidationError } from 'class-validator'
import { plainToClass } from 'class-transformer'
import IsOptional from './isOptional'

import * as utils from '../utils/utils'

const objectIsEmpty = jest.spyOn(utils, 'objectIsEmpty')

class TestClass {
  @IsOptional()
  @MinLength(100)
  value: string
}

describe('isOptional', () => {
  it('should validate the field if the value is not empty', async () => {
    objectIsEmpty.mockReturnValue(false)
    const value = plainToClass(TestClass, { value: 'validate me' })
    const errors: ValidationError[] = await validate(value)

    expect(errors.length).toBe(1)
    expect(errors[0].constraints).toEqual({
      minLength: 'value must be longer than or equal to 100 characters',
    })
  })

  it('should not validate the field if the value is empty', async () => {
    objectIsEmpty.mockReturnValue(true)
    const value = plainToClass(TestClass, { value: 'validate me' })
    const errors: ValidationError[] = await validate(value)

    expect(errors.length).toBe(0)
  })
})
