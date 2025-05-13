import { Expose } from 'class-transformer'
import { IsArray, IsOptional } from 'class-validator'

class AdditionalConditions {
  @Expose()
  @IsOptional()
  @IsArray()
  additionalConditions: string[]
}

export default AdditionalConditions
