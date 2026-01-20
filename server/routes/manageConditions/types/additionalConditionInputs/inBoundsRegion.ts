import { Expose, Transform } from 'class-transformer'
import IsValidZoneDefinitionFile from '../../../../validators/IsValidZoneDefinitionFile'

export default class InBoundsRegion {
  @Expose()
  @IsValidZoneDefinitionFile()
  filename: string

  @Expose()
  @Transform(({ obj }) => obj.fileTargetField)
  fileTargetField!: string
}
