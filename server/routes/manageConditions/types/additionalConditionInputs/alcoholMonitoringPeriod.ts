import { Expose, Type } from 'class-transformer'
import { IsNotEmpty, Validate } from 'class-validator'
import { SimpleDate } from '..'
import ValidSimpleDate from '../../../../validators/simpleDateValidator'
import DateIsBefore from '../../../../validators/dateIsBefore'
import DateIsBeforeEarliestReleaseDate from '../../../../validators/dateIsBeforeEarliestReleaseDate'

class AlcoholMonitoringPeriod {
  @Expose()
  @IsNotEmpty({ message: 'Enter a timeframe' })
  timeframe: string

  @Expose()
  @Type(() => SimpleDate)
  @Validate(ValidSimpleDate)
  @DateIsBefore('licence.licenceExpiryDate', {
    message: 'The monitoring end date must be before the licence expiry date',
  })
  @DateIsBeforeEarliestReleaseDate({
    message: 'The monitoring end date must be on or after the release date',
  })
  endDate: SimpleDate
}

export default AlcoholMonitoringPeriod
