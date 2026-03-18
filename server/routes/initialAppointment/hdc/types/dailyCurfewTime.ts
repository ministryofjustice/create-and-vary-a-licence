import { Expose, Type } from 'class-transformer'
import { IsInt, IsNotEmpty, Validate } from 'class-validator'
import ValidCurfewTime from '../../../../validators/curfewTimeValidator'
import { SimpleTime } from '../../../manageConditions/types'
import type { Day } from '../../../../enumeration/days'

class DailyCurfewTime {
  @Expose()
  @Type(() => SimpleTime)
  @Validate(ValidCurfewTime)
  fromTime: SimpleTime

  @Expose()
  @IsNotEmpty()
  fromDay: Day

  @Expose()
  @Type(() => SimpleTime)
  @Validate(ValidCurfewTime)
  untilTime: SimpleTime

  @Expose()
  @IsNotEmpty()
  untilDay: Day

  @Expose()
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  sequence: number
}

export default DailyCurfewTime
