import { Expose } from 'class-transformer'

class AdditionalConditions {
  @Expose()
  additionalConditions: string[]
}

export default AdditionalConditions
