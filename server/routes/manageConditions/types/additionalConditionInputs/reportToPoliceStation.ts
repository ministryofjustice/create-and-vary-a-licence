import { Expose, Transform, Type } from 'class-transformer'
import { IsNotEmpty, Validate, ValidateIf } from 'class-validator'
import { SimpleTime } from '..'
import ValidSimpleTime from '../../../../validators/simpleTimeValidator'

class ReportToPoliceStation {
  @Expose()
  @IsNotEmpty({ message: 'Enter name of police station' })
  policeStation: string

  @Expose()
  @IsNotEmpty({ message: 'Select when the person needs to report ' })
  reportingFrequency: string

  @Expose()
  @Transform(({ obj, value }) => {
    return obj.reportingFrequency === 'Other' ? value : undefined
  })
  @ValidateIf(o => o.reviewFrequency === 'Other')
  @IsNotEmpty({ message: 'Enter a review period' })
  alternativeReportingFrequency: string

  @Expose()
  @IsNotEmpty({ message: 'Select how many times the person needs to report per day' })
  numberOfReportingTimes: string

  @Expose()
  @Type(() => SimpleTime)
  @Transform(({ obj, value }) => {
    return obj.numberOfReportingTimes === 'Once a day' ? value : undefined
  })
  @ValidateIf(o => o.numberOfReportingTimes === 'Once a day')
  @Validate(ValidSimpleTime)
  reportingTime: SimpleTime

  @Expose()
  @Type(() => SimpleTime)
  @Transform(({ obj, value }) => {
    return obj.numberOfReportingTimes === 'Twice a day' ? value : undefined
  })
  @ValidateIf(o => o.numberOfReportingTimes === 'Twice a day')
  @Validate(ValidSimpleTime)
  reportingTime1: SimpleTime

  @Expose()
  @Type(() => SimpleTime)
  @Transform(({ obj, value }) => {
    return obj.numberOfReportingTimes === 'Twice a day' ? value : undefined
  })
  @ValidateIf(o => o.numberOfReportingTimes === 'Twice a day')
  @Validate(ValidSimpleTime)
  reportingTime2: SimpleTime

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
