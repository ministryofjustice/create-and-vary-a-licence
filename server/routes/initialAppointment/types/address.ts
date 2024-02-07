import { Expose } from 'class-transformer'
import { IsNotEmpty, IsOptional } from 'class-validator'
import Stringable from '../../creatingLicences/types/abstract/stringable'

class Address extends Stringable {
  @Expose()
  @IsNotEmpty({ message: 'Enter a building and street' })
  addressLine1: string

  @Expose()
  @IsOptional()
  addressLine2: string

  @Expose()
  @IsNotEmpty({ message: 'Enter a town or city' })
  addressTown: string

  @Expose()
  @IsOptional()
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
