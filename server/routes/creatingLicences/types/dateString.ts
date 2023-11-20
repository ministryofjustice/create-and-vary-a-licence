import { Expose } from 'class-transformer'
import moment, { Moment } from 'moment'

class DateString {
  constructor(date: string) {
    this.calendarDate = date
  }

  @Expose()
  calendarDate: string

  toMoment(): Moment {
    return moment(this.calendarDate, 'DD/MM/YYYY')
  }
}

export default DateString
