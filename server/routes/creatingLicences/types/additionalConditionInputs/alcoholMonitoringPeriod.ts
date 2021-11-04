import { Expose, Type } from 'class-transformer'
import { IsNotEmpty, Validate } from 'class-validator'
import SimpleDate from '../date'
import ValidSimpleDate from '../../../../validators/simpleDateValidator'

class AlcoholMonitoringPeriod {
  @Expose()
  @IsNotEmpty({ message: 'Enter a timeframe' })
  timeframe: string

  @Expose()
  @Type(() => SimpleDate)
  @Validate(ValidSimpleDate)
  endDate: SimpleDate
}

export default AlcoholMonitoringPeriod
