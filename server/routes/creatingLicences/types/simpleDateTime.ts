import { Expose, Type } from 'class-transformer'
import { Validate } from 'class-validator'
import SimpleDate from './date'
import ValidSimpleDate from '../../../validators/simpleDateValidator'
import SimpleTime from './time'
import ValidSimpleTime from '../../../validators/simpleTimeValidator'
import DateIsAfter from '../../../validators/dateIsAfter'
import DateIsBefore from '../../../validators/dateIsBefore'

class SimpleDateTime {
  static fromSimpleDateAndTime = (simpleDate: SimpleDate, simpleTime: SimpleTime): SimpleDateTime => {
    const val = new SimpleDateTime()
    val.date = simpleDate
    val.time = simpleTime
    return val
  }

  @Expose()
  @Type(() => SimpleDate)
  @Validate(ValidSimpleDate)
  @DateIsBefore('licence.licenceExpiryDate', {
    message: 'Appointment date must be before the end of the licence date',
  })
  @DateIsAfter('licence.conditionalReleaseDate', {
    message: 'Appointment date must be on or after the release date',
  })
  date: SimpleDate

  @Expose()
  @Type(() => SimpleTime)
  @Validate(ValidSimpleTime)
  time: SimpleTime
}

export default SimpleDateTime
