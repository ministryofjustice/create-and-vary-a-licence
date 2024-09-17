import { Expose } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'

class SubstanceMisuse {
  @Expose()
  @IsNotEmpty({ message: 'Select all that apply' })
  substanceTypes: string[]
}

export default SubstanceMisuse
