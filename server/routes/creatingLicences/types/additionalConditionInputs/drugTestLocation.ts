import { Expose, Type } from 'class-transformer'
import { IsNotEmpty, ValidateNested } from 'class-validator'
import Address from '../address'

class DrugTestLocation {
  @Expose()
  @IsNotEmpty({ message: 'Enter a name' })
  name: string

  @Expose()
  @Type(() => Address)
  @ValidateNested()
  address: Address
}

export default DrugTestLocation
