import { Expose, Type } from 'class-transformer'
import { Validate } from 'class-validator'
import { SimpleDate } from '..'
import ValidSimpleDate from '../../../../validators/simpleDateValidator'
import DateIsBefore from '../../../../validators/dateIsBefore'
import DateIsAfterExpectedReleaseDate from '../../../../validators/dateIsAfterExpectedReleaseDate'

class ElectronicMonitoringPeriod {
  @Expose()
  @Type(() => SimpleDate)
  @Validate(ValidSimpleDate)
  @DateIsBefore('licence.licenceExpiryDate', {
    message: 'The monitoring end date must be before the licence expiry date',
  })
  @DateIsAfterExpectedReleaseDate()
  endDate: SimpleDate
}

export default ElectronicMonitoringPeriod
