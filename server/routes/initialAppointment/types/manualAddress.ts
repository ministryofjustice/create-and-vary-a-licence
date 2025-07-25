import { Expose } from 'class-transformer'
import { IsNotEmpty, IsOptional } from 'class-validator'

class ManualAddress {
  @Expose()
  @IsNotEmpty({ message: 'Enter a building and street' })
  firstLine: string

  @Expose()
  @IsOptional()
  secondLine: string

  @Expose()
  @IsNotEmpty({ message: 'Enter a town or city' })
  townOrCity: string

  @Expose()
  @IsOptional()
  county: string

  @Expose()
  @IsNotEmpty({ message: 'Enter a postcode' })
  postcode: string
}

export default ManualAddress
