import { Expose, Transform, Type } from 'class-transformer'
import { IsNotEmpty, Validate, ValidateIf } from 'class-validator'
import { SimpleTime } from '..'
import ValidCurfewTime from '../../../../validators/curfewTimeValidator'
import CurfewType from '../../../../enumeration/CurfewType'

class CurfewTerms {
  @Expose()
  @IsNotEmpty({ message: 'Select a number of curfews' })
  numberOfCurfews: string

  // One curfew
  @Expose()
  @Type(() => SimpleTime)
  @Transform(({ obj, value }) => (obj.numberOfCurfews === CurfewType.ONE_CURFEW ? value : undefined))
  @ValidateIf(o => o.numberOfCurfews === CurfewType.ONE_CURFEW)
  @Validate(ValidCurfewTime, {
    context: { summaryPrefix: (fieldMessage: string) => `For the first curfew, ${fieldMessage}` },
  })
  oneCurfewStart: SimpleTime

  @Expose()
  @Type(() => SimpleTime)
  @Transform(({ obj, value }) => (obj.numberOfCurfews === CurfewType.ONE_CURFEW ? value : undefined))
  @ValidateIf(o => o.numberOfCurfews === CurfewType.ONE_CURFEW)
  @Validate(ValidCurfewTime, {
    context: { summaryPrefix: (fieldMessage: string) => `For the first curfew, ${fieldMessage}` },
  })
  oneCurfewEnd: SimpleTime

  // Two curfews
  @Expose()
  @Type(() => SimpleTime)
  @Transform(({ obj, value }) => (obj.numberOfCurfews === CurfewType.TWO_CURFEWS ? value : undefined))
  @ValidateIf(o => o.numberOfCurfews === CurfewType.TWO_CURFEWS)
  @Validate(ValidCurfewTime, {
    context: { summaryPrefix: (fieldMessage: string) => `For the first curfew, ${fieldMessage}` },
  })
  twoCurfewStart: SimpleTime

  @Expose()
  @Type(() => SimpleTime)
  @Transform(({ obj, value }) => (obj.numberOfCurfews === CurfewType.TWO_CURFEWS ? value : undefined))
  @ValidateIf(o => o.numberOfCurfews === CurfewType.TWO_CURFEWS)
  @Validate(ValidCurfewTime, {
    context: { summaryPrefix: (fieldMessage: string) => `For the first curfew, ${fieldMessage}` },
  })
  twoCurfewEnd: SimpleTime

  @Expose()
  @Type(() => SimpleTime)
  @Transform(({ obj, value }) => (obj.numberOfCurfews === CurfewType.TWO_CURFEWS ? value : undefined))
  @ValidateIf(o => o.numberOfCurfews === CurfewType.TWO_CURFEWS)
  @Validate(ValidCurfewTime, {
    context: { summaryPrefix: (fieldMessage: string) => `For the second curfew, ${fieldMessage}` },
  })
  twoCurfewStart2: SimpleTime

  @Expose()
  @Type(() => SimpleTime)
  @Transform(({ obj, value }) => (obj.numberOfCurfews === CurfewType.TWO_CURFEWS ? value : undefined))
  @ValidateIf(o => o.numberOfCurfews === CurfewType.TWO_CURFEWS)
  @Validate(ValidCurfewTime, {
    context: { summaryPrefix: (fieldMessage: string) => `For the second curfew, ${fieldMessage}` },
  })
  twoCurfewEnd2: SimpleTime

  // Three curfews
  @Expose()
  @Type(() => SimpleTime)
  @Transform(({ obj, value }) => (obj.numberOfCurfews === CurfewType.THREE_CURFEWS ? value : undefined))
  @ValidateIf(o => o.numberOfCurfews === CurfewType.THREE_CURFEWS)
  @Validate(ValidCurfewTime, {
    context: { summaryPrefix: (fieldMessage: string) => `For the first curfew, ${fieldMessage}` },
  })
  threeCurfewStart: SimpleTime

  @Expose()
  @Type(() => SimpleTime)
  @Transform(({ obj, value }) => (obj.numberOfCurfews === CurfewType.THREE_CURFEWS ? value : undefined))
  @ValidateIf(o => o.numberOfCurfews === CurfewType.THREE_CURFEWS)
  @Validate(ValidCurfewTime, {
    context: { summaryPrefix: (fieldMessage: string) => `For the first curfew, ${fieldMessage}` },
  })
  threeCurfewEnd: SimpleTime

  @Expose()
  @Type(() => SimpleTime)
  @Transform(({ obj, value }) => (obj.numberOfCurfews === CurfewType.THREE_CURFEWS ? value : undefined))
  @ValidateIf(o => o.numberOfCurfews === CurfewType.THREE_CURFEWS)
  @Validate(ValidCurfewTime, {
    context: { summaryPrefix: (fieldMessage: string) => `For the second curfew, ${fieldMessage}` },
  })
  threeCurfewStart2: SimpleTime

  @Expose()
  @Type(() => SimpleTime)
  @Transform(({ obj, value }) => (obj.numberOfCurfews === CurfewType.THREE_CURFEWS ? value : undefined))
  @ValidateIf(o => o.numberOfCurfews === CurfewType.THREE_CURFEWS)
  @Validate(ValidCurfewTime, {
    context: { summaryPrefix: (fieldMessage: string) => `For the second curfew, ${fieldMessage}` },
  })
  threeCurfewEnd2: SimpleTime

  @Expose()
  @Type(() => SimpleTime)
  @Transform(({ obj, value }) => (obj.numberOfCurfews === CurfewType.THREE_CURFEWS ? value : undefined))
  @ValidateIf(o => o.numberOfCurfews === CurfewType.THREE_CURFEWS)
  @Validate(ValidCurfewTime, {
    context: { summaryPrefix: (fieldMessage: string) => `For the third curfew, ${fieldMessage}` },
  })
  threeCurfewStart3: SimpleTime

  @Expose()
  @Type(() => SimpleTime)
  @Transform(({ obj, value }) => (obj.numberOfCurfews === CurfewType.THREE_CURFEWS ? value : undefined))
  @ValidateIf(o => o.numberOfCurfews === CurfewType.THREE_CURFEWS)
  @Validate(ValidCurfewTime, {
    context: { summaryPrefix: (fieldMessage: string) => `For the third curfew, ${fieldMessage}` },
  })
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
