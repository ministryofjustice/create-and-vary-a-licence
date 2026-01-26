import { Expose, Transform } from 'class-transformer'
import IsValidZoneDefinitionFile from '../../../../validators/IsValidZoneDefinitionFile'

export default class OutOfBoundsRegionPolicyV3 {
  @Expose()
  @IsValidZoneDefinitionFile()
  filename: string

  @Expose()
  @Transform(({ obj }) => obj.fileTargetField)
  fileTargetField!: string
}
