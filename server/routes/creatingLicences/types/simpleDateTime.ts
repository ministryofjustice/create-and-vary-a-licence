import { Expose, Type } from 'class-transformer'
import { Validate } from 'class-validator'
import SimpleDate from './date'
import ValidSimpleDate from '../../../validators/simpleDateValidator'
import SimpleTime from './time'
import ValidSimpleTime from '../../../validators/simpleTimeValidator'
import DateIsBefore from '../../../validators/dateIsBefore'
import DateIsBeforeEarliestReleaseDate from '../../../validators/dateIsBeforeEarliestReleaseDate'
import DateIsOnWorkDay from '../../../validators/dateIsOnWorkDay'

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
  @DateIsOnWorkDay({
    message: 'The date you entered is on a weekend or bank holiday',
  })
  @DateIsBeforeEarliestReleaseDate({
    message: 'Appointment date cannot be more than 3 working days before release date',
  })
  date: SimpleDate

  @Expose()
  @Type(() => SimpleTime)
  @Validate(ValidSimpleTime)
  time: SimpleTime
}

export default SimpleDateTime
