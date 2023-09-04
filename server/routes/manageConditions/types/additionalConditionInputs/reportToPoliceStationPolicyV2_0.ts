import { Expose, Transform, Type } from 'class-transformer'
import { IsNotEmpty, Validate, ValidateIf } from 'class-validator'
import { SimpleTime } from '..'
import ValidSimpleTime from '../../../../validators/simpleTimeValidator'

// eslint-disable-next-line camelcase
class ReportToPoliceStationPolicyV2_0 {
  @Expose()
  @IsNotEmpty({ message: 'Enter name of police station' })
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

// eslint-disable-next-line camelcase
export default ReportToPoliceStationPolicyV2_0
