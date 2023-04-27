import { Expose } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'
import IsValidExclusionZoneFile from '../../../../validators/isValidExclusionZoneFile'

export default class OutOfBoundsRegion {
  @Expose()
  @IsNotEmpty({ message: 'Enter the name of the area on the map' })
  outOfBoundArea: string

  @Expose()
  @IsValidExclusionZoneFile()
  outOfBoundFilename: string
}
