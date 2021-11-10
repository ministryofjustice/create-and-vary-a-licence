import { Expose } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'

class RestrictionOfResidency {
  @Expose()
  @IsNotEmpty({ message: 'Select the relevant gender' })
  gender: string

  @Expose()
  @IsNotEmpty({ message: 'Select the relevant age' })
  age: string
}

export default RestrictionOfResidency
