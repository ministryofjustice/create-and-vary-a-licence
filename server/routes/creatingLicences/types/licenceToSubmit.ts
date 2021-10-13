import { Expose } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'

class LicenceToSubmit {
  @Expose()
  @IsNotEmpty({ message: 'The person to meet at the induction meeting must be entered' })
  appointmentPerson: string

  @Expose()
  @IsNotEmpty({ message: 'The address of the induction meeting must be entered' })
  appointmentAddress: string

  @Expose()
  @IsNotEmpty({ message: 'The telephone number for the induction meeting must be entered' })
  comTelephone: string

  @Expose()
  @IsNotEmpty({ message: 'The date and time of the induction meeting must be entered' })
  appointmentTime: string
}

export default LicenceToSubmit
