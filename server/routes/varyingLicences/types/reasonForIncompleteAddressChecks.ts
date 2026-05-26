import { Expose } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'

class ReasonForIncompleteAddressChecks {
  @Expose()
  @IsNotEmpty({ message: 'You must add a reason for the address checks being incomplete' })
  reason: string
}

export default ReasonForIncompleteAddressChecks
