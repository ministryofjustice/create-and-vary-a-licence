import { validate, ValidationError } from 'class-validator'
import { Expose, plainToInstance } from 'class-transformer'
import { AdditionalCondition } from '../@types/licenceApiClientTypes'
import ConditionsHaveBeenExpanded from './conditionsHaveBeenExpanded'

class TestClass {
  @Expose()
  @ConditionsHaveBeenExpanded({ message: 'Conditions not expanded' })
  additionalConditions: AdditionalCondition[]
}

describe('Validate that additional conditions have been expanded with user input', () => {
  it('should pass validation for empty condition list', async () => {
    const value = plainToInstance(TestClass, { additionalConditions: [] })
    const errors: ValidationError[] = await validate(value)
    expect(errors.length).toBe(0)
  })

  it('should pass validation for a condition that is ready to submit', async () => {
    const value = plainToInstance(TestClass, {
      additionalConditions: [
        {
          text: 'Condition 1',
          code: 'CON1',
          data: [],
          readyToSubmit: true,
        },
      ],
    })
    const errors: ValidationError[] = await validate(value)
    expect(errors.length).toBe(0)
  })

  it('should fail validation for a condition that is not ready to submit', async () => {
    const value = plainToInstance(TestClass, {
      additionalConditions: [
        {
          text: 'Condition 1 [input]',
          code: 'CON1',
          data: [],
          readyToSubmit: false,
        },
      ],
    })
    const errors: ValidationError[] = await validate(value)
    expect(errors.length).toBe(1)
    expect(errors[0].constraints).toEqual({
      conditionsAreExpanded: 'Conditions not expanded',
    })
  })
})
