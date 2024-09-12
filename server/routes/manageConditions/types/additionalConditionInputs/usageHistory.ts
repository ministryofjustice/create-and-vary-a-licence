import { Expose } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'

class UsageHistory {
  @Expose()
  @IsNotEmpty({ message: 'Select the relevant devices' })
  deviceTypes: string[]
}

export default UsageHistory
