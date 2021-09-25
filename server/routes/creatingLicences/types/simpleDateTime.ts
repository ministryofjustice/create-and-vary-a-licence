import 'reflect-metadata'
import { Expose, Type } from 'class-transformer'
import { Validate } from 'class-validator'
import SimpleDate from './date'
import ValidSimpleDate from '../../../validators/simpleDateValidator'
import SimpleTime from './time'
import ValidSimpleTime from '../../../validators/simpleTimeValidator'

class SimpleDateTime {
  @Expose()
  @Type(() => SimpleDate)
  @Validate(ValidSimpleDate)
  inductionDate: SimpleDate

  @Expose()
  @Type(() => SimpleTime)
  @Validate(ValidSimpleTime)
  inductionTime: SimpleTime
}

export default SimpleDateTime
