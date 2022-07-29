import { Expose } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'

class ReasonForVariation {
  @Expose()
  @IsNotEmpty({ message: 'You must add a reason for each variation' })
  reasonForVariation: string
}

export default ReasonForVariation
