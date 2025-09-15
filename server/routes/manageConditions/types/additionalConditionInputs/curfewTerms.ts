import { Expose, Transform, Type } from 'class-transformer'
import { IsNotEmpty, Validate, ValidateIf } from 'class-validator'
import { SimpleTime } from '..'
import ValidCurfewTime from '../../../../validators/curfewTimeValidator'

class CurfewTerms {
  @Expose()
  @IsNotEmpty({ message: 'Select a number of curfews' })
  numberOfCurfews: string

  // One curfew
  @Expose()
  @Type(() => SimpleTime)
  @Transform(({ obj, value }) => (obj.numberOfCurfews === 'One curfew' ? value : undefined))
  @ValidateIf(o => o.numberOfCurfews === 'One curfew')
  @Validate(ValidCurfewTime, { context: { summaryPrefix: () => 'For the first curfew,' } })
  oneCurfewStart: SimpleTime

  @Expose()
  @Type(() => SimpleTime)
  @Transform(({ obj, value }) => (obj.numberOfCurfews === 'One curfew' ? value : undefined))
  @ValidateIf(o => o.numberOfCurfews === 'One curfew')
  @Validate(ValidCurfewTime, { context: { summaryPrefix: () => 'For the first curfew,' } })
  oneCurfewEnd: SimpleTime

  // Two curfews
  @Expose()
  @Type(() => SimpleTime)
  @Transform(({ obj, value }) => (obj.numberOfCurfews === 'Two curfews' ? value : undefined))
  @ValidateIf(o => o.numberOfCurfews === 'Two curfews')
  @Validate(ValidCurfewTime, { context: { summaryPrefix: () => 'For the first curfew,' } })
  twoCurfewStart: SimpleTime

  @Expose()
  @Type(() => SimpleTime)
  @Transform(({ obj, value }) => (obj.numberOfCurfews === 'Two curfews' ? value : undefined))
  @ValidateIf(o => o.numberOfCurfews === 'Two curfews')
  @Validate(ValidCurfewTime, { context: { summaryPrefix: () => 'For the first curfew,' } })
  twoCurfewEnd: SimpleTime

  @Expose()
  @Type(() => SimpleTime)
  @Transform(({ obj, value }) => (obj.numberOfCurfews === 'Two curfews' ? value : undefined))
  @ValidateIf(o => o.numberOfCurfews === 'Two curfews')
  @Validate(ValidCurfewTime, { context: { summaryPrefix: () => 'For the second curfew,' } })
  twoCurfewStart2: SimpleTime

  @Expose()
  @Type(() => SimpleTime)
  @Transform(({ obj, value }) => (obj.numberOfCurfews === 'Two curfews' ? value : undefined))
  @ValidateIf(o => o.numberOfCurfews === 'Two curfews')
  @Validate(ValidCurfewTime, { context: { summaryPrefix: () => 'For the second curfew,' } })
  twoCurfewEnd2: SimpleTime

  // Three curfews
  @Expose()
  @Type(() => SimpleTime)
  @Transform(({ obj, value }) => (obj.numberOfCurfews === 'Three curfews' ? value : undefined))
  @ValidateIf(o => o.numberOfCurfews === 'Three curfews')
  @Validate(ValidCurfewTime, { context: { summaryPrefix: () => 'For the first curfew,' } })
  threeCurfewStart: SimpleTime

  @Expose()
  @Type(() => SimpleTime)
  @Transform(({ obj, value }) => (obj.numberOfCurfews === 'Three curfews' ? value : undefined))
  @ValidateIf(o => o.numberOfCurfews === 'Three curfews')
  @Validate(ValidCurfewTime, { context: { summaryPrefix: () => 'For the first curfew,' } })
  threeCurfewEnd: SimpleTime

  @Expose()
  @Type(() => SimpleTime)
  @Transform(({ obj, value }) => (obj.numberOfCurfews === 'Three curfews' ? value : undefined))
  @ValidateIf(o => o.numberOfCurfews === 'Three curfews')
  @Validate(ValidCurfewTime, { context: { summaryPrefix: () => 'For the second curfew,' } })
  threeCurfewStart2: SimpleTime

  @Expose()
  @Type(() => SimpleTime)
  @Transform(({ obj, value }) => (obj.numberOfCurfews === 'Three curfews' ? value : undefined))
  @ValidateIf(o => o.numberOfCurfews === 'Three curfews')
  @Validate(ValidCurfewTime, { context: { summaryPrefix: () => 'For the second curfew,' } })
  threeCurfewEnd2: SimpleTime

  @Expose()
  @Type(() => SimpleTime)
  @Transform(({ obj, value }) => (obj.numberOfCurfews === 'Three curfews' ? value : undefined))
  @ValidateIf(o => o.numberOfCurfews === 'Three curfews')
  @Validate(ValidCurfewTime, { context: { summaryPrefix: () => 'For the third curfew,' } })
  threeCurfewStart3: SimpleTime

  @Expose()
  @Type(() => SimpleTime)
  @Transform(({ obj, value }) => (obj.numberOfCurfews === 'Three curfews' ? value : undefined))
  @ValidateIf(o => o.numberOfCurfews === 'Three curfews')
  @Validate(ValidCurfewTime, { context: { summaryPrefix: () => 'For the third curfew,' } })
  threeCurfewEnd3: SimpleTime

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
