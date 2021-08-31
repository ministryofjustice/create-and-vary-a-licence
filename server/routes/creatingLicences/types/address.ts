import { Expose } from 'class-transformer'
import { IsNotEmpty, IsOptional, Matches } from 'class-validator'

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
  @Matches(/[A-Za-z]{1,2}[0-9Rr][0-9A-Za-z]?\s?[0-9][ABD-HJLNP-UW-Zabd-hjlnp-uw-z]{2}/, {
    message: 'Enter a valid postcode',
  })
  addressPostcode: string
}

export default Address
