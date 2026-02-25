import { Expose, Type } from 'class-transformer'
import { Validate } from 'class-validator'
import ValidCurfewTime from '../../../../validators/curfewTimeValidator'
import { SimpleTime } from '../../../manageConditions/types'

class CurfewTimes {
  @Expose()
  @Type(() => SimpleTime)
  @Validate(ValidCurfewTime)
  curfewStart: SimpleTime

  @Expose()
  @Type(() => SimpleTime)
  @Validate(ValidCurfewTime)
  curfewEnd: SimpleTime
}

export default CurfewTimes
