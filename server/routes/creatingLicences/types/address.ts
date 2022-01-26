import { Expose } from 'class-transformer'
import { IsNotEmpty, IsOptional } from 'class-validator'
import Stringable from './abstract/stringable'
import DoesNotContainMarkup from '../../../validators/doesNotContainMarkup'

class Address extends Stringable {
  @Expose()
  @IsNotEmpty({ message: 'Enter a building and street' })
  @DoesNotContainMarkup({ message: 'HTML markup characters are not allowed in text fields' })
  addressLine1: string

  @Expose()
  @IsOptional()
  @DoesNotContainMarkup({ message: 'HTML markup characters are not allowed in text fields' })
  addressLine2: string

  @Expose()
  @IsNotEmpty({ message: 'Enter a town or city' })
  @DoesNotContainMarkup({ message: 'HTML markup characters are not allowed in text fields' })
  addressTown: string

  @Expose()
  @IsOptional()
  @DoesNotContainMarkup({ message: 'HTML markup characters are not allowed in text fields' })
  addressCounty: string

  @Expose()
  @IsNotEmpty({ message: 'Enter a postcode' })
  @DoesNotContainMarkup({ message: 'HTML markup characters are not allowed in text fields' })
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
