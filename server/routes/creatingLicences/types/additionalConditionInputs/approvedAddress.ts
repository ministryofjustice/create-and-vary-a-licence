import { Expose, Type } from 'class-transformer'
import { ValidateNested } from 'class-validator'
import Address from '../address'

class ApprovedAddress {
  @Expose()
  @Type(() => Address)
  @ValidateNested()
  approvedAddress: Address
}

export default ApprovedAddress
