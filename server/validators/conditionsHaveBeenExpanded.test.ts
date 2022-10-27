import { validate, ValidationError } from 'class-validator'
import { Expose, plainToInstance } from 'class-transformer'
import { AdditionalCondition } from '../@types/licenceApiClientTypes'
import ConditionsHaveBeenExpanded from './conditionsHaveBeenExpanded'
import ConditionService from '../services/conditionService'

const conditionService = new ConditionService(null) as jest.Mocked<ConditionService>
const conditionsConfigSpy = jest.spyOn(conditionService, 'getAdditionalConditionByCode')

class TestClass {
  @Expose()
  @ConditionsHaveBeenExpanded({ message: 'Conditions not expanded' })
  additionalConditions: AdditionalCondition[]
}

describe('Validate that additional conditions have been expanded with user input', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should pass validation for empty condition list', async () => {
    const value = plainToInstance(TestClass, { additionalConditions: [] })
    const errors: ValidationError[] = await validate(value)
    expect(errors.length).toBe(0)
  })

  it('should pass validation for a condition which does not require input', async () => {
    conditionsConfigSpy.mockResolvedValue({
      text: 'Condition 1',
      code: 'CON1',
      requiresInput: false,
      category: 'group1',
    })
    const value = plainToInstance(TestClass, {
      additionalConditions: [
        {
          text: 'Condition 1',
          code: 'CON1',
          data: [],
        },
      ],
    })
    const errors: ValidationError[] = await validate(value)
    expect(errors.length).toBe(0)
  })

  it('should pass validation for a condition which has input', async () => {
    conditionsConfigSpy.mockResolvedValue({
      text: 'Condition 1',
      code: 'CON1',
      requiresInput: true,
      category: 'group1',
    })
    const value = plainToInstance(TestClass, {
      additionalConditions: [
        {
          text: 'Condition 1 [input]',
          code: 'CON1',
          data: [
            {
              field: 'field',
              value: 'value',
            },
          ],
        },
      ],
    })
    const errors: ValidationError[] = await validate(value)
    expect(errors.length).toBe(0)
  })

  it('should fail validation when the condition requires input and none were provided', async () => {
    conditionsConfigSpy.mockResolvedValue({
      text: 'Condition 1',
      code: 'CON1',
      requiresInput: true,
      category: 'group1',
    })
    const value = plainToInstance(TestClass, {
      additionalConditions: [
        {
          text: 'Condition 1 [input]',
          code: 'CON1',
          data: [],
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
