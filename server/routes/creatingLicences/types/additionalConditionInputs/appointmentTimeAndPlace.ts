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

class AppointmentTimeAndPlace {
  @Expose()
  @Type(() => SimpleTime)
  @Validate(ValidSimpleTime)
  @IsOptional()
  appointmentTime: SimpleTime

  @Expose()
  @Type(() => SimpleDate)
  @Validate(ValidSimpleDate)
  @IsOptional()
  @DateIsBefore('licence.licenceExpiryDate', {
    message: 'Appointment date must be before the end of the licence date',
  })
  @DateIsAfter('licence.conditionalReleaseDate', {
    message: 'Appointment date must be after the conditional release date',
  })
  appointmentDate: SimpleDate

  @Expose()
  @Type(() => Address)
  @ValidateNested()
  appointmentAddress: Address
}

export default AppointmentTimeAndPlace
