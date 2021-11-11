import { Expose, Transform, Type } from 'class-transformer'
import { IsNotEmpty, Validate, ValidateIf } from 'class-validator'
import SimpleTime from '../time'
import ValidSimpleTime from '../../../../validators/simpleTimeValidator'

class ReportToPoliceStation {
  @Expose()
  @IsNotEmpty({ message: 'Enter at least one police station' })
  policeStation: string

  @Expose()
  @Type(() => SimpleTime)
  @Validate(ValidSimpleTime)
  reportingTime: SimpleTime

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

export default ReportToPoliceStation
