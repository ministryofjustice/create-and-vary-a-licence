import { Expose } from 'class-transformer'
import IsValidRestrictionZoneFile from '../../../../validators/isValidRestrictionZoneFile'

export default class InBoundsRegion {
  @Expose()
  @IsValidRestrictionZoneFile()
  inBoundFilename: string
}
