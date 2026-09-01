import { Expose, Type } from 'class-transformer'
import { Validate } from 'class-validator'
import { SimpleDate } from '..'
import ValidSimpleDate from '../../../../validators/simpleDateValidator'
import DateIsBefore from '../../../../validators/dateIsBefore'
import DateIsStrictlyAfter from '../../../../validators/dateIsStrictlyAfter'

class ElectronicMonitoringPeriod {
  @Expose()
  @Type(() => SimpleDate)
  @Validate(ValidSimpleDate)
  @DateIsBefore('licence.licenceExpiryDate', {
    message: 'The monitoring end date must be before the licence expiry date',
  })
  @DateIsStrictlyAfter('licence.licenceStartDate', {
    message:
      'Enter a date that is after their release. Choose to skip this step if the end date has not been confirmed',
  })
  endDate: SimpleDate
}

export default ElectronicMonitoringPeriod
