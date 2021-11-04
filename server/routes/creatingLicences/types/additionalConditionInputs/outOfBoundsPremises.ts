import { Expose, Type } from 'class-transformer'
import { IsNotEmpty, ValidateNested } from 'class-validator'
import Address from '../address'

class OutOfBoundsPremises {
  @Expose()
  @IsNotEmpty({ message: 'Enter the name of the premises' })
  nameOfPremises: string

  @Expose()
  @Type(() => Address)
  @ValidateNested()
  premisesAddress: Address
}

export default OutOfBoundsPremises
