import { Expose, Type } from 'class-transformer'
import { IsNotEmpty, Validate } from 'class-validator'
import { SimpleDate } from '../index'
import ValidSimpleDate from '../../../../validators/simpleDateValidator'
import DateIsAfterExpectedReleaseDate from '../../../../validators/dateIsAfterExpectedReleaseDate'

class ElectronicMonitoringTypesV4 {
  @Expose()
  @IsNotEmpty({ message: 'Select the options that apply' })
  electronicMonitoringTypes: string[]

  @Expose()
  @Type(() => SimpleDate)
  @Validate(ValidSimpleDate)
  @DateIsAfterExpectedReleaseDate({
    message: 'End date cannot be more than 3 working days before release',
  })
  endDate: SimpleDate
}

export default ElectronicMonitoringTypesV4
