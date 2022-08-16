import { Expose } from 'class-transformer'
import { IsNotEmpty, IsEmail } from 'class-validator'

class PrisonIdAndEmail {
  @Expose()
  @IsNotEmpty({ message: 'Enter prison ID' })
  prisonIdEdit: string

  @Expose()
  @IsNotEmpty({ message: 'Enter OMU email' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string
}

export default PrisonIdAndEmail
