import { Expose } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'

class PrisonIdDelete {
  @Expose()
  @IsNotEmpty({ message: 'Enter prison ID' })
  prisonIdDelete: string
}

export default PrisonIdDelete
