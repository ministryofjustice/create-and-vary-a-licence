import { Expose, Type } from 'class-transformer'
import { IsNotEmpty, IsOptional, Validate, ValidateIf } from 'class-validator'
import { SimpleTime } from '../index'
import ValidSimpleTime from '../../../../validators/simpleTimeValidator'

class DrinkingEstablishment {
  @Expose()
  @IsNotEmpty({ message: 'Select a time restriction' })
  timeRestriction: string

  @Expose()
  @Type(() => SimpleTime)
  @ValidateIf(o => o.timeRestriction === 'Between specified times')
  @Validate(ValidSimpleTime)
  firstCurfewStart: SimpleTime

  @Expose()
  @Type(() => SimpleTime)
  @ValidateIf(o => o.timeRestriction === 'Between specified times')
  @Validate(ValidSimpleTime)
  firstCurfewEnd: SimpleTime

  @Expose()
  @Type(() => SimpleTime)
  @ValidateIf(
    o =>
      o.timeRestriction === 'Between specified times' &&
      (!SimpleTime.isEmptySimpleTime(o.secondCurfewStart) || !SimpleTime.isEmptySimpleTime(o.secondCurfewEnd)),
  )
  @Validate(ValidSimpleTime)
  secondCurfewStart: SimpleTime

  @Expose()
  @Type(() => SimpleTime)
  @IsOptional()
  @ValidateIf(
    o =>
      o.timeRestriction === 'Between specified times' &&
      (!SimpleTime.isEmptySimpleTime(o.secondCurfewEnd) || !SimpleTime.isEmptySimpleTime(o.secondCurfewStart)),
  )
  @Validate(ValidSimpleTime)
  secondCurfewEnd: SimpleTime
}

export default DrinkingEstablishment
