import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import LicenceToSubmit from './licenceToSubmit'

describe('@ValidateIf for electronicMonitoringProvider', () => {
  it('should NOT validate electronicMonitoringProvider if status is NOT_NEEDED', async () => {
    const plain = {
      appointmentPersonType: 'DUTY_OFFICER',
      appointmentAddress: 'address',
      appointmentContact: '0123456789',
      appointmentTimeType: 'IMMEDIATE_UPON_RELEASE',
      additionalLicenceConditions: [] as string[],
      additionalPssConditions: [] as string[],
      electronicMonitoringProviderStatus: 'NOT_NEEDED',
      electronicMonitoringProvider: null as undefined,
    }
    const instance = plainToInstance(LicenceToSubmit, plain, { excludeExtraneousValues: true })
    const errors = await validate(instance)
    expect(errors.some(e => e.property === 'electronicMonitoringProvider')).toBe(false)
  })

  it('should NOT validate electronicMonitoringProvider if property is null', async () => {
    const plain = {
      appointmentPersonType: 'DUTY_OFFICER',
      appointmentAddress: 'address',
      appointmentContact: '0123456789',
      appointmentTimeType: 'IMMEDIATE_UPON_RELEASE',
      additionalLicenceConditions: [] as string[],
      additionalPssConditions: [] as string[],
      electronicMonitoringProviderStatus: 'COMPLETE',
      electronicMonitoringProvider: null as undefined,
    }
    const instance = plainToInstance(LicenceToSubmit, plain, { excludeExtraneousValues: true })
    const errors = await validate(instance)
    expect(errors.some(e => e.property === 'electronicMonitoringProvider')).toBe(false)
  })

  it('should validate electronicMonitoringProvider if status is not NOT_NEEDED and property is present', async () => {
    const plain = {
      appointmentPersonType: 'DUTY_OFFICER',
      appointmentAddress: 'address',
      appointmentContact: '0123456789',
      appointmentTimeType: 'IMMEDIATE_UPON_RELEASE',
      additionalLicenceConditions: [] as string[],
      additionalPssConditions: [] as string[],
      electronicMonitoringProviderStatus: 'COMPLETE',
      electronicMonitoringProvider: {},
    }
    const instance = plainToInstance(LicenceToSubmit, plain, { excludeExtraneousValues: true })
    const errors = await validate(instance)
    expect(errors.some(e => e.property === 'electronicMonitoringProvider')).toBe(true)
  })
})
