import { Expose, Type } from 'class-transformer'
import { Validate } from 'class-validator'
import SimpleDate from '../date'
import ValidSimpleDate from '../../../../validators/simpleDateValidator'
import DateIsBefore from '../../../../validators/dateIsBefore'
import DateIsAfterExpectedReleaseDate from '../../../../validators/dateIsAfterExpectedReleaseDate'

class ElectronicMonitoringPeriod {
  @Expose()
  endDate: string

  @Expose()
  infoInputReviewed: boolean
}

export default ElectronicMonitoringPeriod
