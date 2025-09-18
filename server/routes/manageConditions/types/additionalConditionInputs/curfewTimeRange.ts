import { Expose, Transform, Type } from 'class-transformer'
import { Validate } from 'class-validator'
import { SimpleTime } from '..'
import ValidCurfewTime from '../../../../validators/curfewTimeValidator'

export class CurfewTimeRange {
  @Expose()
  @Type(() => SimpleTime)
  @Transform(({ value }) => value)
  @Validate(ValidCurfewTime, {
    context: {
      summaryPrefix: (obj: CurfewTimeRange) => `For curfew ${obj.curfewIndex},`,
    },
  })
  start: SimpleTime

  @Expose()
  @Type(() => SimpleTime)
  @Transform(({ value }) => value)
  @Validate(ValidCurfewTime, {
    context: {
      summaryPrefix: (obj: CurfewTimeRange) => `For curfew ${obj.curfewIndex},`,
    },
  })
  end: SimpleTime

  curfewIndex?: number

  slotIndex?: number
}

export default CurfewTimeRange
