import { Expose } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'

class ReasonForReferral {
  @Expose()
  @IsNotEmpty({ message: 'Please provide a short explanation why amendments should be made to this variation' })
  reasonForReferral: string
}

export default ReasonForReferral
