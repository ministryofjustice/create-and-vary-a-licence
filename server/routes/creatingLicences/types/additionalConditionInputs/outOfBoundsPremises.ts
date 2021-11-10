import { Expose, Type } from 'class-transformer'
import { IsNotEmpty, ValidateNested } from 'class-validator'
import Address from '../address'
import { Either } from '../../../../validators/decorators'

class OutOfBoundsPremises {
  @Expose()
  @IsNotEmpty({ message: 'Enter the name of the premises' })
  @Either('premisesAddress')
  nameOfPremises: string

  @Expose()
  @Type(() => Address)
  @ValidateNested()
  @Either('nameOfPremises')
  premisesAddress: Address
}

export default OutOfBoundsPremises
