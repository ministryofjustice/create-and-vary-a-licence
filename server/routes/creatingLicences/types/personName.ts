import { Expose } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'

class PersonName {
  @Expose()
  @IsNotEmpty({ message: 'Enter the name of a person' })
  contactName: string
}

export default PersonName
