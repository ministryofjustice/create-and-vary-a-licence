import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import type { TimeServedProbationConfirmContactRequest } from '../../../@types/licenceApiClientTypes'
import CreateTimeServedProbationConfirmContact from './createTimeServedProbationConfirmContact'

type ContactStatus = TimeServedProbationConfirmContactRequest['contactStatus']
type CommunicationMethod = TimeServedProbationConfirmContactRequest['communicationMethods'][number]

describe('CreateTimeServedProbationConfirmContact', () => {
  const validateDto = async (
    input: Partial<{
      contactStatus: ContactStatus
      communicationMethods: CommunicationMethod[]
      otherCommunicationDetail?: string
    }>,
  ) => {
    const instance = plainToInstance(CreateTimeServedProbationConfirmContact, input)
    return validate(instance)
  }

  it('should pass validation with valid contactStatus and communicationMethods', async () => {
    // Given
    const input = {
      contactStatus: 'YES' as ContactStatus,
      communicationMethods: ['EMAIL'] as CommunicationMethod[],
    }

    // When
    const errors = await validateDto(input)

    // Then
    expect(errors.length).toBe(0)
  })

  it('should fail validation when contactStatus is empty', async () => {
    // Given
    const input = {
      contactStatus: '' as ContactStatus,
      communicationMethods: ['EMAIL'] as CommunicationMethod[],
    }

    // When
    const errors = await validateDto(input)

    // Then
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0].constraints?.isNotEmpty).toBe('Confirm if you have contacted the probation team')
  })

  it('should fail validation when communicationMethods is empty', async () => {
    // Given
    const input = {
      contactStatus: 'YES' as ContactStatus,
      communicationMethods: [] as CommunicationMethod[],
    }

    // When
    const errors = await validateDto(input)

    // Then
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0].constraints?.arrayNotEmpty).toBe('Choose a form of communication')
  })

  it('should transform a single communicationMethod string into an array', async () => {
    // Given
    const input = {
      contactStatus: 'YES' as ContactStatus,
      communicationMethods: 'EMAIL' as unknown as CommunicationMethod,
    }

    // When
    const instance = plainToInstance(CreateTimeServedProbationConfirmContact, input)

    // Then
    expect(Array.isArray(instance.communicationMethods)).toBe(true)
    expect(instance.communicationMethods).toEqual(['EMAIL'])
  })

  it('should require otherCommunicationDetail when communicationMethods includes OTHER', async () => {
    // Given
    const input = {
      contactStatus: 'YES' as ContactStatus,
      communicationMethods: ['OTHER'] as CommunicationMethod[],
      otherCommunicationDetail: '',
    }

    // When
    const errors = await validateDto(input)

    // Then
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0].constraints?.isNotEmpty).toBe('Enter a form of communication')
  })

  it('should pass validation when communicationMethods includes OTHER and otherCommunicationDetail is provided', async () => {
    // Given
    const input = {
      contactStatus: 'YES' as ContactStatus,
      communicationMethods: ['OTHER'] as CommunicationMethod[],
      otherCommunicationDetail: 'Phone call',
    }

    // When
    const errors = await validateDto(input)

    // Then
    expect(errors.length).toBe(0)
  })

  it('should pass validation when multiple communicationMethods are provided including OTHER with detail', async () => {
    // Given
    const input = {
      contactStatus: 'YES' as ContactStatus,
      communicationMethods: ['EMAIL', 'OTHER'] as CommunicationMethod[],
      otherCommunicationDetail: 'Phone call',
    }

    // When
    const errors = await validateDto(input)

    // Then
    expect(errors.length).toBe(0)
  })
})
