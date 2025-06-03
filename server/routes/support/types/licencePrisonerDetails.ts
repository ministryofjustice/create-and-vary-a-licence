import { Expose, Type } from 'class-transformer'
import { IsNotEmpty, IsOptional, Validate } from 'class-validator'
import SimpleDate from '../../creatingLicences/types/date'
import ValidSimpleDate from '../../../validators/simpleDateValidator'

class LicencePrisonerDetails {
  @Expose()
  @IsNotEmpty({ message: 'You must enter a forename' })
  forename: string

  @Expose()
  @IsOptional()
  middleNames?: string

  @Expose()
  @IsNotEmpty({ message: 'You must enter a surname' })
  surname: string

  @Expose()
  @Type(() => SimpleDate)
  @Validate(ValidSimpleDate, [{ pastAllowed: true }])
  dateOfBirth: SimpleDate

  @Expose()
  @IsNotEmpty({ message: 'You must enter a reason' })
  reason: string
}

export default LicencePrisonerDetails
