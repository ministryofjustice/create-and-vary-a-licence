import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import NomisOrCvl from './nomisOrCvl'

describe('nomisOrCvl', () => {
  const validateDto = async (input: { answer: string; reasonForUsingNomis?: string }) => {
    const instance = plainToInstance(NomisOrCvl, input)
    return validate(instance)
  }

  it('should pass validation with "Yes"', async () => {
    const errors = await validateDto({ answer: 'Yes' })
    expect(errors.length).toBe(0)
  })

  it('should pass validation with "No" and a reason', async () => {
    const errors = await validateDto({ answer: 'No', reasonForUsingNomis: 'Some Reason' })
    expect(errors.length).toBe(0)
  })

  it('should fail validation with empty answer ', async () => {
    const errors = await validateDto({ answer: '' })
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0].constraints?.isNotEmpty).toBe('Choose how you will create this licence')
  })

  it('should fail validation when no reason for using nomis is provided', async () => {
    const errors = await validateDto({ answer: 'No', reasonForUsingNomis: '' })
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0].constraints?.isNotEmpty).toBe('You must add a reason for using NOMIS')
  })
})
