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
  @Validate(ValidCurfewTime)
  oneCurfewStart: SimpleTime

  @Expose()
  @Type(() => SimpleTime)
  @Transform(({ obj, value }) => (obj.numberOfCurfews === 'One curfew' ? value : undefined))
  @ValidateIf(o => o.numberOfCurfews === 'One curfew')
  @Validate(ValidCurfewTime)
  oneCurfewEnd: SimpleTime

  // Two curfews
  @Expose()
  @Type(() => SimpleTime)
  @Transform(({ obj, value }) => (obj.numberOfCurfews === 'Two curfews' ? value : undefined))
  @ValidateIf(o => o.numberOfCurfews === 'Two curfews')
  @Validate(ValidCurfewTime)
  twoCurfewStart: SimpleTime

  @Expose()
  @Type(() => SimpleTime)
  @Transform(({ obj, value }) => (obj.numberOfCurfews === 'Two curfews' ? value : undefined))
  @ValidateIf(o => o.numberOfCurfews === 'Two curfews')
  @Validate(ValidCurfewTime)
  twoCurfewEnd: SimpleTime

  @Expose()
  @Type(() => SimpleTime)
  @Transform(({ obj, value }) => (obj.numberOfCurfews === 'Two curfews' ? value : undefined))
  @ValidateIf(o => o.numberOfCurfews === 'Two curfews')
  @Validate(ValidCurfewTime)
  twoCurfewStart2: SimpleTime

  @Expose()
  @Type(() => SimpleTime)
  @Transform(({ obj, value }) => (obj.numberOfCurfews === 'Two curfews' ? value : undefined))
  @ValidateIf(o => o.numberOfCurfews === 'Two curfews')
  @Validate(ValidCurfewTime)
  twoCurfewEnd2: SimpleTime

  // Three curfews
  @Expose()
  @Type(() => SimpleTime)
  @Transform(({ obj, value }) => (obj.numberOfCurfews === 'Three curfews' ? value : undefined))
  @ValidateIf(o => o.numberOfCurfews === 'Three curfews')
  @Validate(ValidCurfewTime)
  threeCurfewStart: SimpleTime

  @Expose()
  @Type(() => SimpleTime)
  @Transform(({ obj, value }) => (obj.numberOfCurfews === 'Three curfews' ? value : undefined))
  @ValidateIf(o => o.numberOfCurfews === 'Three curfews')
  @Validate(ValidCurfewTime)
  threeCurfewEnd: SimpleTime

  @Expose()
  @Type(() => SimpleTime)
  @Transform(({ obj, value }) => (obj.numberOfCurfews === 'Three curfews' ? value : undefined))
  @ValidateIf(o => o.numberOfCurfews === 'Three curfews')
  @Validate(ValidCurfewTime)
  threeCurfewStart2: SimpleTime

  @Expose()
  @Type(() => SimpleTime)
  @Transform(({ obj, value }) => (obj.numberOfCurfews === 'Three curfews' ? value : undefined))
  @ValidateIf(o => o.numberOfCurfews === 'Three curfews')
  @Validate(ValidCurfewTime)
  threeCurfewEnd2: SimpleTime

  @Expose()
  @Type(() => SimpleTime)
  @Transform(({ obj, value }) => (obj.numberOfCurfews === 'Three curfews' ? value : undefined))
  @ValidateIf(o => o.numberOfCurfews === 'Three curfews')
  @Validate(ValidCurfewTime)
  threeCurfewStart3: SimpleTime

  @Expose()
  @Type(() => SimpleTime)
  @Transform(({ obj, value }) => (obj.numberOfCurfews === 'Three curfews' ? value : undefined))
  @ValidateIf(o => o.numberOfCurfews === 'Three curfews')
  @Validate(ValidCurfewTime)
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
