import { Expose } from 'class-transformer'
import { IsNotEmpty, IsOptional } from 'class-validator'
import Stringable from './abstract/stringable'

class Address extends Stringable {
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

  stringify(): string {
    return Object.values(this).join(', ')
  }

  static fromString(value: string): Address {
    if (!value) {
      return undefined
    }
    const addressParts = value.split(', ')
    const address = new Address()
    address.addressLine1 = addressParts[0] || null
    address.addressLine2 = addressParts[1] || null
    address.addressTown = addressParts[2] || null
    address.addressCounty = addressParts[3] || null
    address.addressPostcode = addressParts[4] || null

    return address
  }
}

export default Address
