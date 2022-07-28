import { Expose } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'

class ReasonForReferral {
  @Expose()
  @IsNotEmpty({ message: 'You must add a reason for wanting to decline the variation request' })
  reasonForReferral: string
}

export default ReasonForReferral
