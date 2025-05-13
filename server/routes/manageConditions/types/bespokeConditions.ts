import { Expose } from 'class-transformer'
import { IsArray } from 'class-validator'

class BespokeConditions {
  @Expose()
  @IsArray()
  conditions: string[]
}

export default BespokeConditions
