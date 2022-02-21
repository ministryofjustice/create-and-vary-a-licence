import { Expose } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'

class ReasonForVariation {
  @Expose()
  @IsNotEmpty({ message: 'Enter a reason for variation' })
  reasonForVariation: string
}

export default ReasonForVariation
