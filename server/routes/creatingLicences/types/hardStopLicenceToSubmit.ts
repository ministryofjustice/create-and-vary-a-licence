import { Expose } from 'class-transformer'
import { IsNotEmpty, ValidateIf } from 'class-validator'
import AppointmentTimeType from '../../../enumeration/appointmentTimeType'

class HardStopLicenceToSubmit {
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
  appointmentTelephoneNumber: string

  @Expose()
  @IsNotEmpty({ message: "Select 'Change' to go back and add appointment date and time" })
  appointmentTimeType: AppointmentTimeType
}

export default HardStopLicenceToSubmit
