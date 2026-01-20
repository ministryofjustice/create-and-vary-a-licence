import { Expose, Transform } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'
import IsValidZoneDefinitionFile from '../../../../validators/IsValidZoneDefinitionFile'

export default class OutOfBoundsEvent {
  @Expose()
  @IsNotEmpty({ message: 'Enter the name of the event' })
  eventName: string

  @Expose()
  @IsValidZoneDefinitionFile()
  filename: string

  @Expose()
  @Transform(({ obj }) => obj.fileTargetField)
  fileTargetField!: string
}
