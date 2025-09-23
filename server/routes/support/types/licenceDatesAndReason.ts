import { Expose, Type } from 'class-transformer'
import { IsNotEmpty, Validate } from 'class-validator'
import SimpleDate from '../../creatingLicences/types/date'
import ValidOptionalSimpleDate from '../../../validators/optionalSimpleDateValidator'

class LicenceDatesAndReason {
  @Expose()
  @Type(() => SimpleDate)
  @Validate(ValidOptionalSimpleDate)
  crd: SimpleDate

  @Expose()
  @Type(() => SimpleDate)
  @Validate(ValidOptionalSimpleDate)
  ard: SimpleDate

  @Expose()
  @Type(() => SimpleDate)
  @Validate(ValidOptionalSimpleDate)
  ssd: SimpleDate

  @Expose()
  @Type(() => SimpleDate)
  @Validate(ValidOptionalSimpleDate)
  sed: SimpleDate

  @Expose()
  @Type(() => SimpleDate)
  @Validate(ValidOptionalSimpleDate)
  lsd: SimpleDate

  @Expose()
  @Type(() => SimpleDate)
  @Validate(ValidOptionalSimpleDate)
  led: SimpleDate

  @Expose()
  @Type(() => SimpleDate)
  @Validate(ValidOptionalSimpleDate)
  tussd: SimpleDate

  @Expose()
  @Type(() => SimpleDate)
  @Validate(ValidOptionalSimpleDate)
  tused: SimpleDate

  @Expose()
  @Type(() => SimpleDate)
  @Validate(ValidOptionalSimpleDate)
  hdcad: SimpleDate

  @Expose()
  @Type(() => SimpleDate)
  @Validate(ValidOptionalSimpleDate)
  hdcEndDate: SimpleDate

  @Expose()
  @Type(() => SimpleDate)
  @Validate(ValidOptionalSimpleDate)
  prrd: SimpleDate

  @Expose()
  @IsNotEmpty({ message: 'You must enter a reason' })
  dateChangeReason: string
}

export default LicenceDatesAndReason
