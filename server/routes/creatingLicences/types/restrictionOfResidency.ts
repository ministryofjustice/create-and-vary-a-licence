import { Expose } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'

class RestrictionOfResidency {
  @Expose()
  @IsNotEmpty({ message: 'Enter a gender' })
  gender: string

  @Expose()
  @IsNotEmpty({ message: 'Select an age' })
  age: string
}

export default RestrictionOfResidency
