import { Expose, Type } from 'class-transformer'
import { ValidateIf, ValidateNested } from 'class-validator'
import RegionOfResidence from './regionOfResidence'

class AdditionalConditions {
  @Expose()
  additionalConditions: string[]

  @Expose()
  @ValidateNested()
  @ValidateIf(o => o.additionalConditions && o.additionalConditions.includes('placeOfResidence'))
  @Type(() => RegionOfResidence)
  placeOfResidence: RegionOfResidence
}

export default AdditionalConditions
