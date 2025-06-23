<<<<<<< HEAD
import { plainToInstance } from 'class-transformer'
import LicenceToSubmit from './licenceToSubmit'
=======
import { Expose, plainToInstance, Type } from 'class-transformer'
import { ValidateIf, ValidateNested } from 'class-validator'
import LicenceToSubmit from './licenceToSubmit'
import ElectronicMonitoringProvider from '../../manageConditions/types/electronicMonitoringProvider'

// Test-only class without @Expose on electronicMonitoringProviderStatus
class LicenceToSubmitNoExpose {
  @Expose()
  appointmentPersonType: string

  @Expose()
  appointmentAddress: string

  @Expose()
  appointmentContact: string

  @Expose()
  appointmentTimeType: string

  @Expose()
  additionalLicenceConditions: string[]

  @Expose()
  additionalPssConditions: string[]

  // No @Expose() here!
  electronicMonitoringProviderStatus: 'NOT_NEEDED' | 'NOT_STARTED' | 'COMPLETE'

  @Expose()
  @ValidateIf(o => o.electronicMonitoringProviderStatus !== 'NOT_NEEDED')
  @ValidateNested()
  @Type(() => Object)
  electronicMonitoringProvider: ElectronicMonitoringProvider
}
>>>>>>> 965e3c34 (tests to prove)

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

<<<<<<< HEAD
    const instance = plainToInstance(LicenceToSubmit, plain, { excludeExtraneousValues: true })
=======
    const instance = plainToInstance(LicenceToSubmitNoExpose, plain, { excludeExtraneousValues: true })
>>>>>>> 965e3c34 (tests to prove)
    delete instance.electronicMonitoringProviderStatus
    expect(instance.electronicMonitoringProviderStatus).toBeUndefined()
  })
})
