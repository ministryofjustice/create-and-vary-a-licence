import { Expose } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'
import AppointmentTimeType from '../../../enumeration/appointmentTimeType'

class HardStopLicenceToSubmit {
  @Expose()
  @IsNotEmpty({ message: "Select 'Change' to go back and add who to meet" })
  appointmentPersonType: string

  @Expose()
  @IsNotEmpty({ message: "Select 'Change' to go back and add appointment address" })
  appointmentAddress: string

  @Expose()
  @IsNotEmpty({ message: "Select 'Change' to go back and add appointment telephone number" })
  appointmentContact: string

  @Expose()
  @IsNotEmpty({ message: "Select 'Change' to go back and add appointment date and time" })
  appointmentTimeType: AppointmentTimeType
}

export default HardStopLicenceToSubmit
