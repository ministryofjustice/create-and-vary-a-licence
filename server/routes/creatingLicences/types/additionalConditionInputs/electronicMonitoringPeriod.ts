import { Expose, Type } from 'class-transformer'
import { Validate } from 'class-validator'
import SimpleDate from '../date'
import ValidSimpleDate from '../../../../validators/simpleDateValidator'

class ElectronicMonitoringPeriod {
  @Expose()
  @Type(() => SimpleDate)
  @Validate(ValidSimpleDate)
  endDate: SimpleDate
}

export default ElectronicMonitoringPeriod
