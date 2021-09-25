import { Expose } from 'class-transformer'
import moment, { Moment } from 'moment'

class SimpleDate {
  constructor(day: string, month: string, year: string) {
    this.day = day
    this.month = month
    this.year = year
  }

  @Expose()
  day: string

  @Expose()
  month: string

  @Expose()
  year: string

  toMoment(): Moment {
    return moment([this.year, this.month, this.day].join('-'), ['YYYY-M-D', 'YY-M-D'], true)
  }
}

export default SimpleDate
