import { validate, ValidationError } from 'class-validator'
import PersonName from './personName'

describe('personName validator test', () => {
  it('should not allow the following phone numbers for telephone', async () => {
    const personName = new PersonName()
    personName.appointmentPersonType = 'SPECIFIC_PERSON'
    personName.contactName = 'x'.repeat(101)

    const errors: ValidationError[] = await validate(personName)

    expect(errors.length).toBe(1)
    expect(errors[0].property).toBe('contactName')
    expect(errors[0].constraints).toEqual({
      maxLength: 'Name or job title must be 100 characters or less',
    })
  })
})
