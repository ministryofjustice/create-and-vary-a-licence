import { Expose } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'

class MedicalAppointmentType {
  @Expose()
  @IsNotEmpty({ message: 'Select all the options that are relevant' })
  appointmentType: string[]
}

export default MedicalAppointmentType
