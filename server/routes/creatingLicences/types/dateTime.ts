import { Expose, Type } from 'class-transformer'
import moment from 'moment'
import { Validate } from 'class-validator'
import type { DateString } from './dateString'
import ValidDateString from '../../../validators/dateStringValidator'
import SimpleTime, { AmPm } from './time'
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

  static toJson(dt: DateTime): string | undefined {
    const { date, time } = dt
    const dateString = date.toString().split('/').reverse().join(' ')
    const dateTimeString = [dateString, time.hour, time.minute, time.ampm].join(' ')
    const momentDt = moment(dateTimeString, 'YYYY MM DD hh mm a')
    return momentDt.isValid() ? momentDt.format('DD/MM/YYYY HH:mm') : undefined
  }

  static toDateTime(dt: string): DateTime | undefined {
    const momentDt = moment(dt, 'D/MM/YYYY HHmm')
    if (!momentDt.isValid()) {
      return undefined
    }
    const dateString = momentDt.format('DD/MM/YYYY')
    const ampm = momentDt.format('a') === 'am' ? AmPm.AM : AmPm.PM
    const simpleTime = new SimpleTime(momentDt.format('hh'), momentDt.format('mm'), ampm)
    return DateTime.fromDateAndTime(dateString, simpleTime)
  }
}

export default DateTime
