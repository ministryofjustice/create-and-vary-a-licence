import { Expose } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'

class MedicalAppointmentType {
  @Expose()
  @IsNotEmpty({ message: 'Select who the appointment will be with' })
  appointmentType: string
}

export default MedicalAppointmentType
