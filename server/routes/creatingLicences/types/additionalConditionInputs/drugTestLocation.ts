import { Expose, Type } from 'class-transformer'
import { IsNotEmpty, ValidateNested } from 'class-validator'
import Address from '../address'
import { Either } from '../../../../validators/decorators'

class DrugTestLocation {
  @Expose()
  @IsNotEmpty({ message: 'Enter a name' })
  @Either('address')
  name: string

  @Expose()
  @Type(() => Address)
  @ValidateNested()
  @Either('name')
  address: Address
}

export default DrugTestLocation
