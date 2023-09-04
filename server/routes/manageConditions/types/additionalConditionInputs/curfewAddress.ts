import { Expose, Type } from 'class-transformer'
import { Validate, ValidateNested } from 'class-validator'
import { SimpleTime, Address } from '..'
import ValidSimpleTime from '../../../../validators/simpleTimeValidator'

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
