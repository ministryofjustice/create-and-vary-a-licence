import { Expose } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'
import IsValidExclusionZoneFile from '../../../../validators/isValidExclusionZoneFile'

export default class OutOfBoundsRegion {
  @Expose()
  @IsNotEmpty({ message: 'Enter the name of the area shown in the attached map' })
  outOfBoundArea: string

  @Expose()
  outOfBoundFilename: string

  @IsValidExclusionZoneFile({ message: 'Select a PDF Map Maker file to continue' })
  uploadFile: Express.Multer.File
}
