import { Expose, Transform, Type } from 'class-transformer'
import { IsNotEmpty, Validate, ValidateIf, ValidateNested } from 'class-validator'
import SimpleTime from '../time'
import ValidSimpleTime from '../../../../validators/simpleTimeValidator'
import Address from '../address'

class CurfewAddress {
  @Expose()
  @Type(() => Address)
  @ValidateNested()
  curfewAddress: Address

  @Expose()
  @Type(() => SimpleTime)
  @Validate(ValidSimpleTime)
  curfewStart: SimpleTime

  @Expose()
  @Type(() => SimpleTime)
  @Validate(ValidSimpleTime)
  curfewEnd: SimpleTime
}

export default CurfewAddress
