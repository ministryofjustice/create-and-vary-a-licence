import { Expose, Transform, Type } from 'class-transformer'
import { IsNotEmpty, Validate, ValidateIf } from 'class-validator'
import { SimpleTime } from '..'
import ValidSimpleTime from '../../../../validators/simpleTimeValidator'

class CurfewTerms {
  @Expose()
  @IsNotEmpty({ message: 'Select a number of curfews' })
  numberOfCurfews: string

  @Expose()
  @Type(() => SimpleTime)
  @Transform(({ obj, value }) => {
    const enteredValues = splitTimes(value)
    return selectRelevantEntry(obj.numberOfCurfews, enteredValues)
  })
  @Validate(ValidSimpleTime)
  curfewStart: SimpleTime

  @Expose()
  @Type(() => SimpleTime)
  @Transform(({ obj, value }) => {
    const enteredValues = splitTimes(value)
    return selectRelevantEntry(obj.numberOfCurfews, enteredValues)
  })
  @Validate(ValidSimpleTime)
  curfewEnd: SimpleTime

  @Expose()
  @Type(() => SimpleTime)
  @Transform(({ obj, value }) => {
    const enteredValues = splitTimes(value)
    return selectRelevantEntry(obj.numberOfCurfews, enteredValues)
  })
  @Validate(ValidSimpleTime)
  @ValidateIf(o => o.numberOfCurfews === 'Two curfews' || o.numberOfCurfews === 'Three curfews')
  curfewStart2: SimpleTime

  @Expose()
  @Type(() => SimpleTime)
  @Transform(({ obj, value }) => {
    const enteredValues = splitTimes(value)
    return selectRelevantEntry(obj.numberOfCurfews, enteredValues)
  })
  @Validate(ValidSimpleTime)
  @ValidateIf(o => o.numberOfCurfews === 'Two curfews' || o.numberOfCurfews === 'Three curfews')
  curfewEnd2: SimpleTime

  @Expose()
  @Type(() => SimpleTime)
  @Transform(({ obj, value }) => {
    const enteredValues = splitTimes(value)
    return selectRelevantEntry(obj.numberOfCurfews, enteredValues)
  })
  @Validate(ValidSimpleTime)
  @ValidateIf(o => o.numberOfCurfews === 'Three curfews')
  curfewStart3: SimpleTime

  @Expose()
  @Type(() => SimpleTime)
  @Transform(({ obj, value }) => {
    const enteredValues = splitTimes(value)
    return selectRelevantEntry(obj.numberOfCurfews, enteredValues)
  })
  @Validate(ValidSimpleTime)
  @ValidateIf(o => o.numberOfCurfews === 'Three curfews')
  curfewEnd3: SimpleTime

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

const splitTimes = (value: SimpleTime) => {
  if (!Array.isArray(value.hour)) {
    return [value]
  }
  return value.hour.map((h: string, index) => {
    const hour = h.length === 1 ? `0${h}` : h
    const minute = value.minute[index].length === 1 ? `0${value.minute[index]}` : value.minute[index]
    return SimpleTime.fromString(`${hour}:${minute} ${value.ampm[index]}`)
  })
}

const selectRelevantEntry = (numberOfCurfews: string, enteredValues: SimpleTime[]) => {
  if (numberOfCurfews === 'One curfew') {
    return enteredValues[enteredValues.length - 3]
  }
  if (numberOfCurfews === 'Two curfews') {
    return enteredValues[enteredValues.length - 2]
  }
  if (numberOfCurfews === 'Three curfews') {
    return enteredValues[enteredValues.length - 1]
  }
  return undefined
}

export default CurfewTerms
