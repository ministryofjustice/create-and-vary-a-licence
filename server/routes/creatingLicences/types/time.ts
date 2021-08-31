import { Expose } from 'class-transformer'

export enum AmPm {
  AM = 'am',
  PM = 'pm',
}

class SimpleTime {
  @Expose()
  hour: string

  @Expose()
  minute: string

  @Expose()
  ampm: AmPm
}

export default SimpleTime
