import { Expose } from 'class-transformer'
import moment, { Moment } from 'moment'

class SimpleDate {
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
