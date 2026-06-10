import { Expose, Type } from 'class-transformer'
import { IsNotEmpty, Validate } from 'class-validator'
import { SimpleDate } from '../index'
import ValidSimpleDate from '../../../../validators/simpleDateValidator'

class ElectronicMonitoringTypesV4 {
  @Expose()
  @IsNotEmpty({ message: 'Select the options that apply' })
  electronicMonitoringTypes: string[]

  @Expose()
  @Type(() => SimpleDate)
  @Validate(ValidSimpleDate)
  endDate: SimpleDate
}

export default ElectronicMonitoringTypesV4
