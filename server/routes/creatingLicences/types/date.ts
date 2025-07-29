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
    return moment(
      [this.year, this.month, this.day].join('-'),
      ['YY-MM-D', 'YYYY-MM-D', 'YYYY-M-DD', 'YYYY-MM-DD', 'YY-M-D', 'YYYY-M-D'],
      true,
    )
  }

  stringify(): string {
    if (this.year && this.month && this.day) {
      return this.toMoment().format('dddd D MMMM YYYY')
    }
    return ''
  }

  static fromString(value: string): SimpleDate {
    if (!value) return undefined
    // Remove ordinal suffixes like 'st', 'nd', 'rd', 'th' from the day
    const cleanedValue = value.replace(/(\d+)(st|nd|rd|th)/, '$1')
    const date = moment(cleanedValue, 'dddd D MMMM YYYY', true)

    if (!date.isValid()) return undefined

    return new SimpleDate(date.format('DD'), date.format('MM'), date.format('YYYY'))
  }
}

export default SimpleDate
