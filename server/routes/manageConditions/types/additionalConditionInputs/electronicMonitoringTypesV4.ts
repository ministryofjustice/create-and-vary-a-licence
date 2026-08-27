import { Expose, Type } from 'class-transformer'
import { IsNotEmpty, Validate } from 'class-validator'
import { SimpleDate } from '../index'
import ValidSimpleDate from '../../../../validators/simpleDateValidator'
import DateIsBefore from '../../../../validators/dateIsBefore'
import DateIsStrictlyAfter from '../../../../validators/dateIsStrictlyAfter'

class ElectronicMonitoringTypesV4 {
  @Expose()
  @IsNotEmpty({ message: 'Select the options that apply' })
  electronicMonitoringTypes: string[]

  @Expose()
  @Type(() => SimpleDate)
  @Validate(ValidSimpleDate)
  @DateIsStrictlyAfter('licence.licenceStartDate', {
    message: 'Enter a date that is after their release',
  })
  @DateIsBefore('licence.licenceExpiryDate', {
    message: 'The monitoring end date must be before the licence expiry date',
  })
  endDate: SimpleDate
}

export default ElectronicMonitoringTypesV4
