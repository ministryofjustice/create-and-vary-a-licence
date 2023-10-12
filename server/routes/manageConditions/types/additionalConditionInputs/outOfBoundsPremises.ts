import { Expose, Type } from 'class-transformer'
import { IsNotEmpty, ValidateIf, ValidateNested } from 'class-validator'
import { Address } from '..'

class OutOfBoundsPremises {
  @Expose()
  @IsNotEmpty({ message: 'Select the information you need' })
  nameTypeAndOrAddress: string

  @Expose()
  @ValidateIf(o => o.nameTypeAndOrAddress && o.nameTypeAndOrAddress !== 'Just an address')
  @IsNotEmpty({ message: 'Enter the name of the premises' })
  nameOfPremises: string

  @Expose()
  @ValidateIf(o => o.nameTypeAndOrAddress && o.nameTypeAndOrAddress !== 'Just a name or type of premises')
  @Type(() => Address)
  @ValidateNested()
  premisesAddress: Address
}

export default OutOfBoundsPremises
