import { Expose, Type } from 'class-transformer'
import { Validate, ValidateNested } from 'class-validator'
import { Address, SimpleTime, SimpleDate } from '..'
import ValidSimpleTime from '../../../../validators/simpleTimeValidator'
import ValidSimpleDate from '../../../../validators/simpleDateValidator'
import IsOptional from '../../../../validators/isOptional'
import DateIsBefore from '../../../../validators/dateIsBefore'
import DateIsBeforeEarliestReleaseDate from '../../../../validators/dateIsBeforeEarliestReleaseDate'

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
  @DateIsBeforeEarliestReleaseDate({
    message: 'Appointment date must be on or after the release date',
  })
  appointmentDate: SimpleDate

  @Expose()
  @Type(() => Address)
  @ValidateNested()
  appointmentAddress: Address
}

export default AppointmentTimeAndPlace
