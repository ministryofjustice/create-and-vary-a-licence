import { Expose } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'

class ReasonForVariation {
  @Expose()
  @IsNotEmpty({ message: 'You must add a reason for everything you want to vary' })
  reasonForVariation: string
}

export default ReasonForVariation
