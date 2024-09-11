import { Expose } from 'class-transformer'
import IsValidExclusionZoneFile from '../../../../validators/isValidExclusionZoneFile'

export default class OutOfBoundsRegionPolicyV3 {
  @Expose()
  @IsValidExclusionZoneFile()
  outOfBoundFilename: string
}
