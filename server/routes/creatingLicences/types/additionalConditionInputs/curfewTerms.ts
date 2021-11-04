import { Expose, Transform, Type } from 'class-transformer'
import { IsNotEmpty, Validate, ValidateIf } from 'class-validator'
import SimpleTime from '../time'
import ValidSimpleTime from '../../../../validators/simpleTimeValidator'

class CurfewTerms {
  @Expose()
  @Type(() => SimpleTime)
  @Validate(ValidSimpleTime)
  curfewStart: SimpleTime

  @Expose()
  @Type(() => SimpleTime)
  @Validate(ValidSimpleTime)
  curfewEnd: SimpleTime

  @Expose()
  @IsNotEmpty({ message: 'Select a review period' })
  reviewPeriod: string

  @Expose()
  @Transform(({ obj, value }) => {
    return obj.reviewPeriod === 'Other' ? value : undefined
  })
  @ValidateIf(o => o.reviewPeriod === 'Other')
  @IsNotEmpty({ message: 'Enter a review period' })
  alternativeReviewPeriod: string
}

export default CurfewTerms
