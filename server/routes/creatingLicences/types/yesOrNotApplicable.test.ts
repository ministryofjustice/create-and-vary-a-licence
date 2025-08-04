import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import YesOrNotApplicableDto from './yesOrNotApplicable'

describe('YesOrNotApplicableDto', () => {
  const validateDto = async (input: { answer: string }) => {
    const instance = plainToInstance(YesOrNotApplicableDto, input)
    return validate(instance)
  }

  it('should pass validation with "Yes"', async () => {
    const errors = await validateDto({ answer: 'Yes' })
    expect(errors.length).toBe(0)
  })

  it('should pass validation with "Not applicable"', async () => {
    const errors = await validateDto({ answer: 'Not applicable' })
    expect(errors.length).toBe(0)
  })

  it('should fail validation with empty answer', async () => {
    const errors = await validateDto({ answer: '' })
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0].constraints?.isNotEmpty).toBe('Select yes or not applicable')
  })

  it('should fail validation with invalid value', async () => {
    const errors = await validateDto({ answer: 'Maybe' })
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0].constraints?.isIn).toBe('Select yes or not applicable')
  })
})
