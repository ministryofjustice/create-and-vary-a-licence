import { Expose, Type } from 'class-transformer'
import { Validate, ValidateNested } from 'class-validator'
import SimpleTime from '../time'
import ValidSimpleTime from '../../../../validators/simpleTimeValidator'
import SimpleDate from '../date'
import ValidSimpleDate from '../../../../validators/simpleDateValidator'
import Address from '../address'

class AppointmentTimeAndPlace {
  @Expose()
  @Type(() => SimpleTime)
  @Validate(ValidSimpleTime)
  appointmentTime: SimpleTime

  @Expose()
  @Type(() => SimpleDate)
  @Validate(ValidSimpleDate)
  appointmentDate: SimpleDate

  @Expose()
  @Type(() => Address)
  @ValidateNested()
  appointmentAddress: Address
}

export default AppointmentTimeAndPlace
