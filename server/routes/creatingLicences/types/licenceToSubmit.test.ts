import { plainToInstance } from 'class-transformer'
import LicenceToSubmit from './licenceToSubmit'

describe('LicenceToSubmit @Expose electronicMonitoringProviderStatus', () => {
  it('should include electronicMonitoringProviderStatus when @Expose is present', async () => {
    const plain = {
      appointmentPersonType: 'DUTY_OFFICER',
      appointmentAddress: 'address',
      appointmentContact: '0123456789',
      appointmentTimeType: 'IMMEDIATE_UPON_RELEASE',
      additionalLicenceConditions: [] as string[],
      additionalPssConditions: [] as string[],
      electronicMonitoringProviderStatus: 'NOT_NEEDED',
      electronicMonitoringProvider: undefined as undefined,
    }

    const instance = plainToInstance(LicenceToSubmit, plain, { excludeExtraneousValues: true })
    expect(instance.electronicMonitoringProviderStatus).toBe('NOT_NEEDED')
  })

  it('should NOT include electronicMonitoringProviderStatus if @Expose is removed', async () => {
    const plain = {
      appointmentPersonType: 'DUTY_OFFICER',
      appointmentAddress: 'address',
      appointmentContact: '0123456789',
      appointmentTimeType: 'IMMEDIATE_UPON_RELEASE',
      additionalLicenceConditions: [] as string[],
      additionalPssConditions: [] as string[],
      electronicMonitoringProviderStatus: 'NOT_NEEDED',
      electronicMonitoringProvider: undefined as undefined,
    }

    const instance = plainToInstance(LicenceToSubmit, plain, { excludeExtraneousValues: true })
    delete instance.electronicMonitoringProviderStatus
    expect(instance.electronicMonitoringProviderStatus).toBeUndefined()
  })
})
