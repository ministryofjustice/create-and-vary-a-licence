import { Expose } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'

class PrisonIdCurrent {
  @Expose()
  @IsNotEmpty({ message: 'Enter prison ID' })
  prisonIdCurrent: string
}

export default PrisonIdCurrent
