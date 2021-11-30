import { Expose, Type } from 'class-transformer'
import { Validate, ValidateNested } from 'class-validator'
import SimpleTime from '../time'
import ValidSimpleTime from '../../../../validators/simpleTimeValidator'
import SimpleDate from '../date'
import ValidSimpleDate from '../../../../validators/simpleDateValidator'
import Address from '../address'
import IsOptional from '../../../../validators/isOptional'
import DateIsAfter from '../../../../validators/dateIsAfter'
import DateIsBefore from '../../../../validators/dateIsBefore'

class AppointmentTimeAndPlaceDuringPss {
  @Expose()
  @Type(() => SimpleTime)
  @Validate(ValidSimpleTime)
  @IsOptional()
  appointmentTime: SimpleTime

  @Expose()
  @Type(() => SimpleDate)
  @Validate(ValidSimpleDate)
  @IsOptional()
  @DateIsBefore('licence.topupSupervisionExpiryDate', {
    message: 'Appointment date must be before the end of the supervision period',
  })
  @DateIsAfter('licence.topupSupervisionStartDate', {
    message: 'Appointment date must be after the supervision start date',
  })
  appointmentDate: SimpleDate

  @Expose()
  @Type(() => Address)
  @ValidateNested()
  appointmentAddress: Address
}

export default AppointmentTimeAndPlaceDuringPss
