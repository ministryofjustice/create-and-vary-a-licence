import { Expose, Type } from 'class-transformer'
import { IsInt, IsNotEmpty, Validate } from 'class-validator'
import { SimpleTime } from '../../../manageConditions/types'
import type { Day } from '../../../../enumeration/days'
import ValidDailyCurfewTime from '../../../../validators/dailyCurfewTimeValidator'

class DailyCurfewTime {
  @Expose()
  @Type(() => SimpleTime)
  @Validate(ValidDailyCurfewTime)
  startTime: SimpleTime

  @Expose()
  @IsNotEmpty()
  startDay: Day

  @Expose()
  @Type(() => SimpleTime)
  @Validate(ValidDailyCurfewTime)
  endTime: SimpleTime

  @Expose()
  @IsNotEmpty()
  endDay: Day

  @Expose()
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  sequence: number

  getSequencedFieldName(fieldName: string): string {
    return `curfews[${this.sequence}][${fieldName}]`
  }
}

export default DailyCurfewTime
