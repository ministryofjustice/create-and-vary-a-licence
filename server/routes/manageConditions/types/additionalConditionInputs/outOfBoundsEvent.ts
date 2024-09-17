import { Expose } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'
import IsValidExclusionZoneFile from '../../../../validators/isValidExclusionZoneFile'

export default class OutOfBoundsEvent {
  @Expose()
  @IsNotEmpty({ message: 'Enter the name of the event' })
  eventName: string

  @Expose()
  @IsValidExclusionZoneFile()
  outOfBoundFilename: string
}
