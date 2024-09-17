import { Expose } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'

class BankAccountDetails {
  @Expose()
  @IsNotEmpty({ message: 'Select the relevant account types' })
  accountTypes: string[]
}

export default BankAccountDetails
