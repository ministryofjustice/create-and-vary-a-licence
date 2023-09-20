import { Expose, Type } from 'class-transformer'
import { IsNotEmpty, ValidateIf, ValidateNested } from 'class-validator'
import { Address } from '..'
import Either from '../../../../validators/either'

class OutOfBoundsPremises {
  @IsNotEmpty({ message: 'Select the information you need' })
  nameTypeAndOrAddress: string

  @Expose()
  @ValidateIf(o => o.nameTypeAndOrAddress !== 'Just an address')
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
