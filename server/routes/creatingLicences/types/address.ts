import { Expose } from 'class-transformer'
import { IsNotEmpty, IsOptional } from 'class-validator'

class Address {
  @Expose()
  @IsNotEmpty({ message: 'Enter a building name or number' })
  addressLine1: string

  @Expose()
  @IsOptional()
  addressLine2: string

  @Expose()
  @IsNotEmpty({ message: 'Enter a town' })
  addressTown: string

  @Expose()
  @IsNotEmpty({ message: 'Enter a county' })
  addressCounty: string

  @Expose()
  @IsNotEmpty({ message: 'Enter a postcode' })
  addressPostcode: string
}

export default Address
