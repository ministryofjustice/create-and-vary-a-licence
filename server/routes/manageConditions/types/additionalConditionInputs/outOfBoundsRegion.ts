import { Expose, Transform } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'
import IsValidZoneDefinitionFile from '../../../../validators/IsValidZoneDefinitionFile'

export default class OutOfBoundsRegion {
  @Expose()
  @IsNotEmpty({ message: 'Enter the name of the area shown on the map' })
  outOfBoundArea: string

  @Expose()
  @IsValidZoneDefinitionFile()
  filename: string

  @Expose()
  @Transform(({ obj }) => obj.fileTargetField)
  fileTargetField!: string
}
