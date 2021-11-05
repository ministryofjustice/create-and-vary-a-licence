import { Expose } from 'class-transformer'
import moment, { Moment } from 'moment'
import Stringable from './abstract/stringable'

export enum AmPm {
  AM = 'am',
  PM = 'pm',
}

class SimpleTime extends Stringable {
  constructor(hour: string, minute: string, ampm: AmPm) {
    super()
    this.hour = hour
    this.minute = minute
    this.ampm = ampm
  }

  @Expose()
  hour: string

  @Expose()
  minute: string

  @Expose()
  ampm: AmPm

  stringify(): string {
    return this.toMoment().format('hh:mm a')
  }

  toMoment(): Moment {
    return moment([this.hour, this.minute, this.ampm].join('-'), ['hh-mm-a'], true)
  }

  static fromString(value: string): SimpleTime {
    if (!value) {
      return undefined
    }
    const time = moment(value, 'hh:mm a', true)
    return new SimpleTime(time.format('hh'), time.format('mm'), <AmPm>time.format('a'))
  }
}

export default SimpleTime
