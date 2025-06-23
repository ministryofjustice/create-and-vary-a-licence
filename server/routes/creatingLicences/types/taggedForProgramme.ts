import { Expose } from 'class-transformer'
import { IsDefined, ValidateIf, IsNotEmpty } from 'class-validator'

class TaggedForProgramme {
  @Expose()
  @IsDefined({ message: 'Select yes or no' })
  isToBeTaggedForProgramme: boolean

  @Expose()
  @ValidateIf(o => o.isToBeTaggedForProgramme === 'Yes')
  @IsNotEmpty({ message: 'Enter the name of the pathfinder or programme' })
  programmeName: string
}

export default TaggedForProgramme
