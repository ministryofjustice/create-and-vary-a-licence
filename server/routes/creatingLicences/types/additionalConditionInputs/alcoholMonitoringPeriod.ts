import { Expose, Type } from 'class-transformer'
import { IsNotEmpty, Validate } from 'class-validator'
import SimpleDate from '../date'
import ValidSimpleDate from '../../../../validators/simpleDateValidator'
import DateIsBefore from '../../../../validators/dateIsBefore'
import DateIsAfter from '../../../../validators/dateIsAfter'

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
  @DateIsAfter('licence.conditionalReleaseDate', {
    message: 'The monitoring end date must be after the conditional release date',
  })
  endDate: SimpleDate
}

export default AlcoholMonitoringPeriod
