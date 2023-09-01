import { Expose } from 'class-transformer'

class BespokeConditions {
  @Expose()
  conditions: string[]
}

export default BespokeConditions
