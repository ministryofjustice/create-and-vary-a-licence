import { Expose } from 'class-transformer'

export enum AmPm {
  AM = 'am',
  PM = 'pm',
}

class SimpleTime {
  constructor(hour: string, minute: string, ampm: AmPm) {
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
}

export default SimpleTime
