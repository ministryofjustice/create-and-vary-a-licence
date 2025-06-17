import { Expose, Type } from 'class-transformer'
import { IsNotEmpty, ValidateIf, ValidateNested } from 'class-validator'
import AdditionalConditions from '../../manageConditions/types/additionalConditions'
import ConditionsHaveBeenExpanded from '../../../validators/conditionsHaveBeenExpanded'
import AppointmentTimeType from '../../../enumeration/appointmentTimeType'
import ElectronicMonitoringProvider from '../../manageConditions/types/electronicMonitoringProvider'

class LicenceToSubmit {
  @Expose()
  @IsNotEmpty({ message: "Select 'Change' to go back and add who to meet" })
  appointmentPersonType: 'DUTY_OFFICER' | 'RESPONSIBLE_COM' | 'SPECIFIC_PERSON'

  @Expose()
  @ValidateIf(o => o.appointmentPersonType === 'SPECIFIC_PERSON')
  @IsNotEmpty({ message: "Select 'Change' to go back and add who to meet" })
  appointmentPerson: string

  @Expose()
  @IsNotEmpty({ message: "Select 'Change' to go back and add appointment address" })
  appointmentAddress: string

  @Expose()
  @IsNotEmpty({ message: "Select 'Change' to go back and add appointment telephone number" })
  appointmentContact: string

  @Expose()
  @IsNotEmpty({ message: "Select 'Change' to go back and add appointment date and time" })
  appointmentTimeType: AppointmentTimeType

  @Expose()
  @ConditionsHaveBeenExpanded({
    message:
      'At least one of the additional conditions you have chosen is incomplete. Check the conditions and add the missing information or remove any conditions you do not need',
  })
  additionalLicenceConditions: AdditionalConditions[]

  @Expose()
  @ConditionsHaveBeenExpanded({
    message:
      'At least one of the additional PSS requirements you have chosen is incomplete. Check the requirements and add the missing information or remove any requirements you do not need',
  })
  additionalPssConditions: AdditionalConditions[]

  @Expose()
  @ValidateIf(o => o.electronicMonitoringProviderStatus !== 'NOT_NEEDED')
  @ValidateNested()
  @Type(() => ElectronicMonitoringProvider)
  electronicMonitoringProvider: ElectronicMonitoringProvider
}

export default LicenceToSubmit
