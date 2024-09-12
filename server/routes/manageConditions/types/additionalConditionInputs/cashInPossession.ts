import { Expose } from 'class-transformer'
import { IsNotEmpty, IsNumberString } from 'class-validator'

class CashInPossession {
  @Expose()
  @IsNotEmpty({ message: 'Enter a value in £' })
  @IsNumberString()
  value: string
}

export default CashInPossession
