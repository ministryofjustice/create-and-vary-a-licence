import { Expose } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'

class LicenceTypeChange {
  @Expose()
  @IsNotEmpty({ message: 'You must select a new licence type' })
  licenceType: string

  @Expose()
  @IsNotEmpty({ message: 'You must enter a reason' })
  reason: string
}

export default LicenceTypeChange
