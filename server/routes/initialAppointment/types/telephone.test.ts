import { validate, ValidationError } from 'class-validator'
import Telephone from './telephone'

describe('Telephone validator test', () => {
  const validNumbers = [
    '0129 825 558',
    '+44 800 890 567',
    '0800 890 567',
    '01632 960901',
    '020 7946 0958',
    '0113 496 0999',
    '+44 20 7946 0958',
    '+44 113 496 0999',
    '(020) 7946 0958',
    '(0113) 496 0999',
    '0121 4960999 #123',
    '+44 121 4960999 #1234',
    '020 79460958',
    '02079460958',
    '+442079460958',
    '07911 123456', // mobile
    '+44 7911 123456', // mobile with country code
    '(07911) 123456', // mobile with brackets
    '+44 161 496 0999', // Manchester landline
    '0161 496 0999', // Manchester local
    '0131 496 0999', // Edinburgh landline
    '(0131) 496 0999', // with brackets
    '0800 123 4567', // freephone with 7 digits
    '+44 800 123 4567', // freephone with country code
    '020 7946 0958 #9', // short extension
    '+44 20 7946 0958 #985', // extension
    '+44 20 7946 0958 #98765', // long extension
    '01632 960901 ext 123', // valid ext suffix
    '01632 960901 x123', // valid x suffix
    '+44 20 7946 0958 x123', // +44 with valid x suffix
  ]

  const invalidNumbers = [
    '', // empty
    '12345', // too short
    'abcd', // not numeric
    '(02079460958)', // no spacing inside brackets
    '01632-960901', // dash not allowed
    '+44(0)2079460958', // mixed country and area formats
    '+44 1234', // too short
    '0207 946 0958123', // too long without separator
    '+44 020 7946 0958', // invalid use of +44 with 0
    '0044 20 7946 0958', // using 0044 instead of +44
    '0207.946.0958', // dots instead of spaces
    '0207/946/0958', // slashes instead of spaces
    '020-7946-0958', // hyphens not allowed
    '01632 960901 ext. 123', // dot suffix not allowed
    '01632 960901 ext.123', // dot suffix not allowed
  ]

  it('should allow the following phone numbers', async () => {
    const validations = await Promise.all(
      validNumbers.map(async number => {
        // Given
        const telephone = new Telephone()
        telephone.telephone = number

        // When
        const errors = await validate(telephone)

        return { number, errors }
      }),
    )

    validations.forEach(({ errors }) => {
      // Then
      expect(errors.length).toBe(0)
    })
  })

  it('should not allow the following phone numbers', async () => {
    const validations = await Promise.all(
      invalidNumbers.map(async number => {
        // Given
        const telephone = new Telephone()
        telephone.telephone = number

        // When
        const errors = await validate(telephone)

        return { number, errors }
      }),
    )

    validations.forEach(({ errors }) => {
      // Then
      expect(errors.length).toBe(1)
      expect(errors[0].constraints).toHaveProperty('matches')
      expect(errors[0].constraints.matches).toEqual('Enter a phone number in the correct format, like 01632 960901')
    })
  })

  it('should fail when telephone is empty', async () => {
    const validateEmptyTelephone = async (): Promise<{ telephone: Telephone; errors: ValidationError[] }> => {
      const telephone = new Telephone()
      telephone.telephone = ''

      const errors = await validate(telephone)
      return { telephone, errors }
    }

    // Then
    const { errors } = await validateEmptyTelephone()
    expect(errors).not.toHaveLength(0)
    expect(errors[0].property).toBe('telephone')
    expect(errors[0].constraints?.isNotEmpty).toBe('Enter a phone number')
  })
})
