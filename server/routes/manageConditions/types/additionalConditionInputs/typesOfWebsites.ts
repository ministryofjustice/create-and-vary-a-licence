import { Expose } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'

class TypesOfWebsites {
  @Expose()
  @IsNotEmpty({ message: 'Select when to contact the supervising officer' })
  contactType: string

  @Expose()
  @IsNotEmpty({ message: 'Select the relevant types of site or app' })
  contentTypes: string[]
}

export default TypesOfWebsites
