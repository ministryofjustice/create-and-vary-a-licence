import { Expose } from 'class-transformer'
import moment, { Moment } from 'moment'
import Stringable from './abstract/stringable'

class SimpleDate extends Stringable {
  constructor(day: string, month: string, year: string) {
    super()
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

  stringify(): string {
    return this.toMoment().format('dddd Do MMMM YYYY')
  }

  static fromString(value: string): SimpleDate {
    if (!value) {
      return undefined
    }
    const date = moment(value, 'dddd Do MMMM YYYY', true)
    return new SimpleDate(date.format('DD'), date.format('MM'), date.format('YYYY'))
  }
}

export default SimpleDate
