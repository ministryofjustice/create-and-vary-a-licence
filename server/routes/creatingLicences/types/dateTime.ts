import { Expose, Type } from 'class-transformer'
import { Validate } from 'class-validator'
import type { DateString } from './dateString'
import ValidDateString from '../../../validators/dateStringValidator'
import SimpleTime from './time'
import ValidSimpleTime from '../../../validators/simpleTimeValidator'
import DateIsBefore from '../../../validators/dateIsBefore'
import DateIsAfterExpectedReleaseDate from '../../../validators/dateIsAfterExpectedReleaseDate'
import DateIsOnWorkDay from '../../../validators/dateIsOnWorkDay'

class DateTime {
  static fromDateAndTime = (date: DateString, simpleTime: SimpleTime): DateTime => {
    const val = new DateTime()
    val.date = date
    val.time = simpleTime
    return val
  }

  @Expose()
  @Validate(ValidDateString)
  @DateIsBefore('licence.licenceExpiryDate', {
    message: 'Appointment date must be before the end of the licence date',
  })
  @DateIsOnWorkDay({
    message: 'The date you entered is on a weekend or bank holiday',
  })
  @DateIsAfterExpectedReleaseDate({
    message: 'Appointment date must be on or after the last working day before the release date',
  })
  date: DateString

  @Expose()
  @Type(() => SimpleTime)
  @Validate(ValidSimpleTime)
  time: SimpleTime
}

export default DateTime
